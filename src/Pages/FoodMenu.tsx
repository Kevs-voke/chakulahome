import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { foodApi, parseApiError } from "../services/api";
import type { FoodDTO } from "../models/Food";
import { useOrderStore } from "..//store/useOrderStore";

function FoodCard({ food, onAdd }: { food: FoodDTO; onAdd: () => void }) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-stone-800/60 border border-stone-700 rounded-xl p-4 flex flex-col gap-2"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-stone-100 capitalize">{food.english_name}</h3>
          {food.local_name && (
            <p className="text-xs text-stone-500 italic">{food.local_name}</p>
          )}
        </div>
        <span className="text-amber-400 font-bold text-sm">
          KES {food.price.toLocaleString()}/kg
        </span>
      </div>
      {food.description && (
        <p className="text-xs text-stone-400 leading-relaxed">{food.description}</p>
      )}
      <button
        onClick={handleAdd}
        className={`mt-1 w-full py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${added
          ? "bg-emerald-600 text-white"
          : "bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-stone-900 border border-amber-500/40 hover:border-transparent"
          }`}
      >
        {added ? "✓ Added to cart" : "Add to Cart"}
      </button>
    </motion.div>
  );
}

export default function FoodMenu() {
  const [tab, setTab] = useState<"name" | "price">("name");
  const [nameQuery, setNameQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [results, setResults] = useState<FoodDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useOrderStore((s) => s.addToCart);
  const cart = useOrderStore((s) => s.cart);
  const totalItems = useOrderStore((s) => s.totalItems);

  async function searchByName() {
    if (!nameQuery.trim()) return;
    setLoading(true); setError(null);
    try {
      const res = await foodApi.getByName(nameQuery.trim().toLowerCase());
      if (!res.ok) {
        const errs = await parseApiError(res);
        setError(errs.form ?? "Food not found");
        setResults([]);
        return;
      }
      const food: FoodDTO = await res.json();
      setResults([food]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function searchByPrice() {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (isNaN(min) || isNaN(max) || min > max) {
      setError("Please enter a valid price range.");
      return;
    }
    setLoading(true); setError(null);
    try {
      const res = await foodApi.getByPriceRange(min, max);
      if (!res.ok) {
        const errs = await parseApiError(res);
        setError(errs.form ?? "No food found in that range");
        setResults([]);
        return;
      }
      const foods: FoodDTO[] = await res.json();
      setResults(foods);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Cart summary */}
      {cart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-amber-900/20 border border-amber-600/40 rounded-xl px-4 py-3 flex justify-between items-center"
        >
          <span className="text-amber-300 text-sm font-medium">
            🛒 {totalItems()} item{totalItems() !== 1 ? "s" : ""} in cart
          </span>
          <span className="text-amber-400 font-bold text-sm">
            KES {useOrderStore.getState().totalPrice().toLocaleString()}
          </span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex bg-stone-800/60 rounded-lg p-1 gap-1">
        {(["name", "price"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setResults([]); setError(null); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t
              ? "bg-amber-500 text-stone-900"
              : "text-stone-400 hover:text-stone-200"
              }`}
          >
            {t === "name" ? "Search by Name" : "Search by Price"}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <AnimatePresence mode="wait">
        {tab === "name" ? (
          <motion.div
            key="name"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-2"
          >
            <input
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchByName()}
              placeholder="e.g. ugali, nyama choma…"
              className="flex-1 bg-stone-800/60 border border-stone-600 rounded-lg px-3 py-2.5 text-sm text-stone-100
                placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500"
            />
            <button
              onClick={searchByName}
              disabled={loading}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {loading ? "…" : "Search"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="price"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-stone-400">Min (KES)</label>
              <input
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                type="number"
                className="w-full bg-stone-800/60 border border-stone-600 rounded-lg px-3 py-2.5 text-sm text-stone-100
                  placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs text-stone-400">Max (KES)</label>
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1000"
                type="number"
                className="w-full bg-stone-800/60 border border-stone-600 rounded-lg px-3 py-2.5 text-sm text-stone-100
                  placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60"
              />
            </div>
            <button
              onClick={searchByPrice}
              disabled={loading}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-lg text-sm transition-all disabled:opacity-50"
            >
              {loading ? "…" : "Find"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3">
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-3">
        {results.map((food) => (
          <FoodCard
            key={food.english_name}
            food={food}
            onAdd={() => addToCart(food, 1)}
          />
        ))}
        {!loading && !error && results.length === 0 && (
          <p className="text-center text-stone-600 text-sm py-8">
            Search for food above to see results.
          </p>
        )}
      </div>
    </div>
  );
}
