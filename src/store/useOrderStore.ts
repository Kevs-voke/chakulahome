import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FoodDTO, OrderItem, Order } from "../models/Food";

// ==================== API TYPES (Backend DTOs) ====================
export type OrderItemRequestDTO = {
  foodName: string;
  quantity: number;
};

export type OrderItemResponseDTO = {
  foodName: string;
  quantity: number;
  pricePerKg: number;
};

export type OrderResponseDTO = {
  id: number;
  items: OrderItemResponseDTO[];
  totalPrice: number;
  status: string;
  createdAt: string;
};

// ==================== MAPPERS ====================
const toDomainOrderItem = (dto: OrderItemResponseDTO): OrderItem => ({
  food: {
    english_name: dto.foodName,
    price: dto.pricePerKg,
  },
  quantity: dto.quantity,
});

const normalizeStatus = (status: string): Order["status"] => {
  const lower = status.toLowerCase();
  const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;

  return validStatuses.includes(lower as any)
    ? (lower as Order["status"])
    : "pending";
};

export const toDomainOrder = (dto: OrderResponseDTO): Order => ({
  id: dto.id.toString(),
  items: dto.items.map(toDomainOrderItem),
  status: normalizeStatus(dto.status),
  totalPrice: dto.totalPrice,
  createdAt: dto.createdAt,
});

type CartState = {
  cart: OrderItem[];
  orders: Order[];
  addToCart: (food: FoodDTO, quantity?: number) => void;
  removeFromCart: (foodName: string) => void;
  updateQuantity: (foodName: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  placeOrder: () => Promise<Order | null>;
  addOrder: (order: Order) => void;
  setOrders: (order: Order[]) => void;
};

export const useOrderStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],

      addToCart: (food, quantity = 1) => {
        set((state) => {
          const existing = state.cart.find(
            (item) => item.food.english_name === food.english_name
          );

          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.food.english_name === food.english_name
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            cart: [...state.cart, { food, quantity }]
          };
        });
      },

      removeFromCart: (foodName) => {
        set((state) => ({
          cart: state.cart.filter(
            (item) => item.food.english_name !== foodName
          ),
        }));
      },

      updateQuantity: (foodName, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(foodName);
          return;
        }

        set((state) => ({
          cart: state.cart.map((item) =>
            item.food.english_name === foodName
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ cart: [] }),

      totalItems: () =>
        get().cart.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().cart.reduce(
          (sum, item) => sum + item.food.price * item.quantity,
          0
        ),

      placeOrder: async () => {
        const { cart, totalPrice, clearCart, addOrder } = get();

        if (cart.length === 0) return null;

        const orderRequest = {
          items: cart.map((item) => ({
            foodName: item.food.english_name,
            quantity: item.quantity,
          })),
        };

        try {
          const res =  await apiRequest(API.ORDERS.MAKE_ORDER,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(orderRequest),
            }
          );

          if (!res.ok) throw new Error("Order placement failed");

          const backendOrder: OrderResponseDTO = await res.json();

          const domainOrder = toDomainOrder(backendOrder);

          addOrder(domainOrder);
          clearCart();

          return domainOrder;
        } catch (error) {
          console.error("Order failed, using local fallback:", error);

          const localOrder: Order = {
            id: crypto.randomUUID(),
            items: [...cart],
            status: "pending",
            totalPrice: totalPrice(),
            createdAt: new Date().toISOString(),
          };

          addOrder(localOrder);
          clearCart();

          return localOrder;
        }
      },
      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    { name: "restaurant-orders" }
  )
);

// ==================== AUTH STORE ====================


type User = {
  email: string;
  username: string;
  firstName?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (email: string, username: string, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (email, username, token) =>
        set({ user: { email, username }, token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token,
    }),
    { name: "restaurant-auth" }
  )
);
