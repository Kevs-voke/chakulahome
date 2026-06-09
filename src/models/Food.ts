export type FoodDTO = {
  english_name: string;
  local_name?: string;
  description?: string;
  price: number;
  category?: string;
  imageUrl?: string;
};

export type OrderItem = {
  food: FoodDTO;
  quantity: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  totalPrice: number;
  createdAt: string;
};
