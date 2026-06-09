
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderStore, toDomainOrder, type OrderResponseDTO } from "../store/useOrderStore";
import type { Order } from "../models/Food";
import { orderApi } from "../services/api"

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
  confirmed: "bg-blue-900/40 text-blue-400 border-blue-700/50",
  preparing: "bg-orange-900/40 text-orange-400 border-orange-700/50",
  ready: "bg-emerald-900/40 text-emerald-400 border-emerald-700/50",
  delivered: "bg-stone-800 text-stone-400 border-stone-600",
};

const STATUS_ICONS: Record<Order["status"], string> = {
  pending: "🕐",
  confirmed: "✅",
  preparing: "👨‍🍳",
  ready: "🔔",
  delivered: "📦",
};

function CartTab() {
  const cart = useOrderStore((s) => s.cart);
  const removeFromCart = useOrderStore((s) => s.removeFromCart);
  const updateQuantity = useOrderStore((s) => s.updateQuantity);
  const clearCart = useOrderStore((s) => s.clearCart);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const totalPrice = useOrderStore((s) => s.totalPrice);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const handleOrder = async () => {
    setPlacing(true);
    await placeOrder();
    setPlacing(false);
    setPlaced(true);
    setTimeout(() => setPlaced(false), 3000);
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12 text-stone-600">
        <div className="text-4xl mb-3">🛒</div>
        <p className="text-sm">Your cart is empty.</p>
        <p className="text-xs text-stone-700 mt-1">Search for food and add items.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence>
        {placed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-900/30 border border-emerald-600/50 rounded-xl px-4 py-3 text-emerald-300 text-sm"
          >
            ✓ Order placed successfully! Check your orders below.
          </motion.div>
        )}
      </AnimatePresence>

      {cart.map((item) => (
        <motion.div
          key={item.food.english_name}
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-stone-800/60 border border-stone-700 rounded-xl p-3 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-200 capitalize truncate">
              {item.food.english_name}
            </p>
            <p className="text-xs text-stone-500">
              KES {item.food.price.toLocaleString()}/kg
            </p>
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.food.english_name, item.quantity - 0.5)}
              className="w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-bold transition-colors"
            >
              −
            </button>
            <span className="text-sm text-stone-100 w-8 text-center font-mono">
              {item.quantity}kg
            </span>
            <button
              onClick={() => updateQuantity(item.food.english_name, item.quantity + 0.5)}
              className="w-7 h-7 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200 text-sm font-bold transition-colors"
            >
              +
            </button>
          </div>

          <div className="text-right min-w-[60px]">
            <p className="text-sm font-bold text-amber-400">
              KES {(item.food.price * item.quantity).toLocaleString()}
            </p>
          </div>

          <button
            onClick={() => removeFromCart(item.food.english_name)}
            className="text-stone-600 hover:text-red-400 transition-colors text-lg leading-none"
            title="Remove"
          >
            ×
          </button>
        </motion.div>
      ))}

      {/* Summary */}
      <div className="border-t border-stone-700 pt-3 flex justify-between items-center">
        <div>
          <p className="text-xs text-stone-500">Total</p>
          <p className="text-xl font-bold text-amber-400">
            KES {totalPrice().toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCart}
            className="px-3 py-2 text-sm text-stone-400 hover:text-red-400 border border-stone-700 hover:border-red-700/50 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleOrder}
            disabled={placing}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-900 font-bold rounded-lg text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            {placing ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const orders = useOrderStore((s) => s.orders);
  const setorders = useOrderStore((s) => s.setOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);

      try {
        const res = await orderApi.getOrders();
        console.log(res);
        const data: OrderResponseDTO[] = await res.json();

        setorders(data.map(toDomainOrder));
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-stone-600">
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-sm">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-stone-600">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">No orders yet.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-stone-600">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm">No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-stone-800/60 border border-stone-700 rounded-xl p-4"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-stone-600">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {new Date(order.createdAt).toLocaleString("en-KE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_ICONS[order.status]} {order.status}
            </span>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            {order.items.map((item) => (
              <div key={item.food.english_name} className="flex justify-between text-sm">
                <span className="text-stone-400 capitalize">{item.food.english_name} × {item.quantity}kg</span>
                <span className="text-stone-300">KES {(item.food.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-700 pt-2 flex justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <span className="text-sm font-bold text-amber-400">
              KES {order.totalPrice.toLocaleString()}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function CartAndOrders() {
  const [tab, setTab] = useState<"cart" | "orders">("cart");
  const cartCount = useOrderStore((s) => s.totalItems());
  const orderCount = useOrderStore((s) => s.orders.length);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex bg-stone-800/60 rounded-lg p-1 gap-1">
        <button
          onClick={() => setTab("cart")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "cart" ? "bg-amber-500 text-stone-900" : "text-stone-400 hover:text-stone-200"
            }`}
        >
          Cart
          {cartCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "cart" ? "bg-stone-900/30 text-stone-900" : "bg-amber-500 text-stone-900"
              }`}>
              {cartCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${tab === "orders" ? "bg-amber-500 text-stone-900" : "text-stone-400 hover:text-stone-200"
            }`}
        >
          Orders
          {orderCount > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "orders" ? "bg-stone-900/30 text-stone-900" : "bg-amber-500 text-stone-900"
              }`}>
              {orderCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "cart" ? (
          <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CartTab />
          </motion.div>
        ) : (
          <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <OrdersTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
