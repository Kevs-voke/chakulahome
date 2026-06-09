import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Register from "../src/Pages/Register";
import Login from "../src/Pages/Login";
import FoodMenu from "../src/Pages/FoodMenu";
import CartAndOrders from "../src/Pages/CartAndOrders";
import { useAuthStore } from "../src/store/useOrderStore";
import { useOrderStore } from "../src/store/useOrderStore";


type AuthPage = "login" | "register";
type AppPage = "menu" | "cart";

export default function App() {
  const [authPage, setAuthPage] = useState<AuthPage>("login");
  const [appPage, setAppPage] = useState<AppPage>("menu");
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartCount = useOrderStore((s) => s.totalItems());

 const authed = useAuthStore((s) => !!s.token);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽</span>
            <span className="font-bold text-amber-400 tracking-tight text-lg">Chakula</span>
          </div>

          {authed ? (
            <div className="flex items-center gap-3">
              <nav className="flex gap-1 bg-stone-900 rounded-lg p-1">
                <button
                  onClick={() => setAppPage("menu")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${appPage === "menu"
                    ? "bg-amber-500 text-stone-900"
                    : "text-stone-400 hover:text-stone-200"
                    }`}
                >
                  Menu
                </button>
                <button
                  onClick={() => setAppPage("cart")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all relative ${appPage === "cart"
                    ? "bg-amber-500 text-stone-900"
                    : "text-stone-400 hover:text-stone-200"
                    }`}
                >
                  Cart & Orders
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-stone-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </nav>
              <button
                onClick={logout}
                className="text-xs text-stone-500 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-1 bg-stone-900 rounded-lg p-1">
              <button
                onClick={() => setAuthPage("login")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${authPage === "login"
                  ? "bg-amber-500 text-stone-900"
                  : "text-stone-400 hover:text-stone-200"
                  }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthPage("register")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${authPage === "register"
                  ? "bg-amber-500 text-stone-900"
                  : "text-stone-400 hover:text-stone-200"
                  }`}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!authed ? (
            <motion.div
              key={authPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Auth card */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl shadow-black/50">
                <div className="mb-5">
                  <h1 className="text-xl font-bold text-stone-100">
                    {authPage === "login" ? "Welcome back" : "Create an account"}
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">
                    {authPage === "login"
                      ? "Sign in to browse our menu and place orders."
                      : "Join us to start ordering delicious food."}
                  </p>
                </div>

                {authPage === "login" ? (
                  <Login
                    onGoToRegister={() => setAuthPage("register")}
                    onSuccess={() => {/* auth store handles this */ }}
                  />
                ) : (
                  <Register
                    onGoToLogin={() => setAuthPage("login")}
                  />
                )}
              </div>
            </motion.div>
          ) : appPage === "menu" ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-stone-100">
                  Our Menu{user?.username ? `, ${user.username}` : ""}
                </h2>
                <p className="text-xs text-stone-500">Search and add items to your cart.</p>
              </div>
              <FoodMenu />
            </motion.div>
          ) : (
            <motion.div
              key="cart"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-stone-100">Cart & Orders</h2>
                <p className="text-xs text-stone-500">Review your cart or track past orders.</p>
              </div>
              <CartAndOrders />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
