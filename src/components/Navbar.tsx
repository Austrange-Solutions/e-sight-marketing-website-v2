'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Plus, Minus, Trash2, User, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const { cart, cartCount, isLoading, removeFromCart, updateQuantity } = useCart();
  
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

  const increaseQty = async (productId: string) => {
    try {
      setUpdating(productId);
      const item = cart.find(item => item.productId === productId);
      if (!item) return;

      // Check if we can increase quantity (don't exceed stock)
      if (item.quantity >= item.stock) {
        console.log(`Cannot increase quantity for ${productId}: at stock limit ${item.stock}`);
        return;
      }

      await updateQuantity(productId, item.quantity + 1);
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdating(null);
    }
  };

  const decreaseQty = async (productId: string) => {
    try {
      setUpdating(productId);
      const item = cart.find(item => item.productId === productId);
      if (!item) return;

      if (item.quantity <= 1) {
        await removeFromCart(productId);
        return;
      }

      await updateQuantity(productId, item.quantity - 1);
    } catch (err) {
      console.error("Error updating quantity:", err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      await removeFromCart(productId);
    } catch (err) {
      console.error("Error removing item:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleCartCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    closeCart();
    router.push("/checkout");
  };

  // Enhanced cart functions
  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  // Auto-close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isCartOpen && !target.closest('.cart-drawer') && !target.closest('.cart-button')) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const totalPrice = Array.isArray(cart) ? cart.reduce(
    (total, item) => {
      const price = item?.price || 0;
      const quantity = item?.quantity || 0;
      return total + (price * quantity);
    },
    0
  ) : 0;

  const totalQuantity = cartCount;

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

              {/* Auth Status */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Hi, {user.username}</span>
                </div>
              )}

              {/* Cart Button */}
              <button
                onClick={() => openCart()}
                className="cart-button relative p-2 rounded-md text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center"
                  >
                    {totalQuantity}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => openCart()}
                className="cart-button relative p-2 rounded-md text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center"
                  >
                    {totalQuantity}
                  </motion.span>
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
            
            {/* Mobile Auth Status */}
            {isAuthenticated && user && (
              <div className="px-3 py-2 text-sm text-gray-600 border-t">
                Welcome, {user.username}
              </div>
            )}
          </div>
        </motion.div>
      </nav>

      {/* Enhanced Cart Drawer with Transparent Background */}
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex justify-end"
        >
          {/* Enhanced Transparent Background Overlay */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 backdrop-blur-md cursor-pointer"
            onClick={closeCart}
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)', // Safari support
            }}
          />
          
          {/* Cart Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className="cart-drawer relative w-full sm:w-96 bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header with Enhanced Close Button */}
            <div className="p-4 flex justify-between items-center border-b bg-gray-50">
              <motion.h2 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-gray-800"
              >
                My Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
              </motion.h2>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-all"
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Enhanced Cart Items with Stagger Animation */}
            <div className="flex-1 overflow-y-auto p-4">
              {!isAuthenticated ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-500 mb-4">Please login to view your cart</p>
                  <Link
                    href="/login"
                    onClick={closeCart}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:scale-105"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </motion.div>
              ) : isLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your cart...</p>
                </motion.div>
              ) : cart.length === 0 ? (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-gray-500">Your cart is empty</p>
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                  className="space-y-4"
                >
                  {cart.map((item) => (
                    <motion.div
                      key={item.productId}
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: { y: 0, opacity: 1 }
                      }}
                      layout
                      className="relative"
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {/* Product Image */}
                        <div className="relative">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-1">
                            {item.name || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-gray-600">₹{item.price || 0}</p>
                          
                          {/* Stock Information */}
                          <div className="text-xs text-gray-500 mt-1">
                            {item.stock <= 5 ? (
                              <span className="text-orange-600 font-medium">
                                Only {item.stock} left in stock
                              </span>
                            ) : (
                              <span>{item.stock} in stock</span>
                            )}
                          </div>
                          
                          {/* Enhanced Quantity Controls */}
                          <div className="flex items-center gap-3 mt-2">
                            <motion.button
                              onClick={() => decreaseQty(item.productId)}
                              disabled={updating === item.productId}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <Minus size={14} />
                            </motion.button>
                            
                            <motion.span 
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="min-w-8 text-center font-medium"
                            >
                              {item.quantity || 0}
                            </motion.span>
                            
                            <motion.button
                              onClick={() => increaseQty(item.productId)}
                              disabled={updating === item.productId || item.quantity >= item.stock}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              title={item.quantity >= item.stock ? `Stock limit reached (${item.stock})` : ''}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </div>
                        
                        {/* Enhanced Delete Button */}
                        <motion.button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating === item.productId}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-full hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                        
                        {/* Loading Overlay */}
                        {updating === item.productId && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg"
                          >
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          </motion.div>
                        )}
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Enhanced Footer with Proceed to Pay Animation */}
            {isAuthenticated && cart.length > 0 && (
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="border-t bg-gray-50 p-4"
              >
                {/* Price Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items ({totalQuantity}):</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <motion.span
                      key={totalPrice}
                      initial={{ scale: 1.1, color: "#10b981" }}
                      animate={{ scale: 1, color: "#374151" }}
                      transition={{ duration: 0.3 }}
                    >
                      ₹{totalPrice.toFixed(2)}
                    </motion.span>
                  </div>
                </div>
                
                {/* Enhanced Proceed to Pay Button */}
                <motion.button 
                  onClick={handleCartCheckout}
                  disabled={cart.length === 0 || updating !== null}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"
                    whileHover={{ opacity: 0.1 }}
                  />
                  <span className="relative z-10 flex items-center justify-center">
                    {updating !== null ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: 5 }}
                          className="flex items-center"
                        >
                          Proceed to Pay
                          <motion.svg 
                            className="w-5 h-5 ml-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            whileHover={{ x: 3 }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </motion.svg>
                        </motion.span>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
