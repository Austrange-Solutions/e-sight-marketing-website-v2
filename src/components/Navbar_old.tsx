'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Plus, Minus, Trash2, User, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth();
  
  const pathname = usePathname();
  const router = useRouter();

  // Dynamic nav items based on auth state
  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home" },
      { path: "/products", label: "Products" },
      { path: "/about", label: "About" },
      { path: "/contact", label: "Contact" },
    ];

    if (isAuthenticated) {
      return [
        ...baseItems,
        { path: "/profile", label: "Profile" },
      ];
    } else {
      return [
        ...baseItems,
        { path: "/login", label: "Login" },
      ];
    }
  };

  const navItems = getNavItems();

  // Fetch cart from backend when drawer opens (only if authenticated)
  useEffect(() => {
    if (isCartOpen && isAuthenticated) {
      const fetchCart = async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/cart", {
            credentials: 'include',
          });
          const data = await res.json();
          
          // Fix: Access the items array correctly
          setCartItems(data.cart?.items || []);
        } catch (err) {
          console.error("Error fetching cart:", err);
          setCartItems([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCart();
    }
  }, [isCartOpen, isAuthenticated]);

  const increaseQty = async (id: string) => {
    try {
      setUpdating(id);
      const item = cartItems.find(item => item._id === id);
      if (!item) return;

      const res = await fetch("/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: id,
          quantity: item.quantity + 1,
        }),
      });

      if (res.ok) {
        // Update local state
        setCartItems(cartItems.map(item => 
          item._id === id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        const errorData = await res.json();
        console.error("Error updating quantity:", errorData.error);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdating(null);
    }
  };

  const decreaseQty = async (id: string) => {
    try {
      setUpdating(id);
      const item = cartItems.find(item => item._id === id);
      if (!item) return;

      if (item.quantity <= 1) {
        // Remove item if quantity would become 0
        await removeItem(id);
        return;
      }

      const res = await fetch("/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: id,
          quantity: item.quantity - 1,
        }),
      });

      if (res.ok) {
        // Update local state
        setCartItems(cartItems.map(item => 
          item._id === id 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      } else {
        const errorData = await res.json();
        console.error("Error updating quantity:", errorData.error);
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    try {
      setUpdating(id);
      const res = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: id }),
      });

      if (res.ok) {
        // Update local state
        setCartItems(cartItems.filter(item => item._id !== id));
      } else {
        const errorData = await res.json();
        console.error("Error removing item:", errorData.error);
      }
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setUpdating(null);
    }
  };

const totalPrice = Array.isArray(cartItems) ? cartItems.reduce(
  (total, item) => {
    // Add null/undefined checks to prevent NaN
    const price = item?.productId?.price || 0;
    const quantity = item?.quantity || 0;
    return total + (price * quantity);
  },
  0
) : 0;

const totalQuantity = Array.isArray(cartItems) ? cartItems.reduce(
  (total, item) => total + (item?.quantity || 0),
  0
) : 0;

  return (
    <>
      <nav className="fixed w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/assets/images/e-sight-logo.png"
                  alt="e-Sight Logo"
                  className="ml-2 h-8"
                />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  e-Sight
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    pathname === item.path
                      ? "text-indigo-600"
                      : "text-gray-600 hover:text-indigo-600"
                  }`}
                >
                  {pathname === item.path && (
                    <motion.div
                      layoutId="underline"
                      className="absolute left-0 right-0 bottom-0 h-0.5 bg-indigo-600"
                    />
                  )}
                  {item.label}
                </Link>
              ))}

              {/* My Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-md text-gray-600 hover:text-indigo-600 transition"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-md text-gray-600 hover:text-indigo-600 transition"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: "auto" },
            closed: { opacity: 0, height: 0 },
          }}
          className="md:hidden overflow-hidden bg-white"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.path
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </nav>

      {/* My Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Drawer without black overlay */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full sm:w-96 bg-white h-full shadow-lg flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">My Cart</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
              ) : cartItems.length === 0 ? (
                <p className="text-center text-gray-500">Your cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 border rounded-lg p-2"
                  >
                    <img
                      src={item.productId?.image || '/placeholder-image.jpg'}
                      alt={item.productId?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.productId?.name || 'Unknown Product'}</h3>
                      <p className="text-sm text-gray-600">₹{item.productId?.price || 0}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => decreaseQty(item._id)}
                          disabled={updating === item._id}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-8 text-center">{item.quantity || 0}</span>
                        <button
                          onClick={() => increaseQty(item._id)}
                          disabled={updating === item._id}
                          className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item._id)}
                      disabled={updating === item._id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                    {updating === item._id && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4">
              <div className="flex justify-between font-semibold mb-4">
                <span>Total:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <span>Items:</span>
                <span>{totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}</span>
              </div>
              <button 
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cartItems.length === 0 || updating !== null}
                onClick={() => {
                  setIsCartOpen(false);
                  router.push("/checkout");
                }}
              >
                Proceed to Pay
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Navbar;