'use client';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Plus, Minus, Trash2, User, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/contexts/CartContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isDonateDomain, setIsDonateDomain] = useState(false);
  const [mainDomainUrl, setMainDomainUrl] = useState('');
  const [resourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const user = session?.user;
  const { cart, cartCount, isLoading, removeFromCart, updateQuantity } = useCart();

  const pathname = usePathname();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect if we're on donate subdomain
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isDonate = hostname.startsWith('donate.');
      setIsDonateDomain(isDonate);
      setIsStoreDomain(isStore || isLegacyProducts);

      // Determine main and store domain URLs (retain legacy products host stripping)
      const mainHostname = hostname.replace(/^(donate|store|products)\./, '');
      const protocol = window.location.protocol;
      const port = window.location.port ? `:${window.location.port}` : '';
      setMainDomainUrl(`${protocol}//${mainHostname}${port}`);
      setStoreDomainUrl(`${protocol}//store.${mainHostname}${port}`);
    }
  }, []);

  // Dynamic nav items based on auth state
  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home" },
      { path: "/products", label: "Products" },
      { path: "/about", label: "About" },
      { path: "/contact", label: "Contact" },
      { path: "/gallery", label: "Gallery" },
      { path: "/support", label: "Support" },
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
    const item = cart.find(item => item.productId === productId);
    if (!item) return;
    if (item.quantity >= item.stock) {
      console.log(`Cannot increase quantity for ${productId}: at stock limit ${item.stock}`);
      return;
    }
    updateQuantity(productId, item.quantity + 1);
  };

  const decreaseQty = async (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      removeFromCart(productId);
      return;
    }
    updateQuantity(productId, item.quantity - 1);
  };

  const removeItem = async (productId: string) => {
    removeFromCart(productId);
  };

  const handleCartCheckout = () => {
    if (!isAuthenticated) {
      // If on donate subdomain, redirect to main domain for login
      if (isDonateDomain) {
        window.location.href = `${mainDomainUrl}/login?redirect=/checkout`;
      } else {
        router.push('/login?redirect=/checkout');
      }
      return;
    }
    closeCart();
    // If on donate subdomain, redirect to main domain for checkout
    if (isDonateDomain) {
      window.location.href = `${mainDomainUrl}/checkout`;
    } else {
      router.push("/checkout");
    }
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

  <nav suppressHydrationWarning className="fixed w-full bg-background/95 backdrop-blur-md shadow-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/assets/images/maceazy-logo.png"
                  alt="Maceazy Logo"
                  className="ml-2 h-8"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                // If on donate subdomain, link to main domain
                const href = isDonateDomain ? `${mainDomainUrl}${item.path}` : item.path;
                const isExternal = isDonateDomain;
                
                return isExternal ? (
                  <a
                    key={item.path}
                    href={href}
                    className="relative px-3 py-2 text-sm font-medium transition-colors duration-200 text-muted-foreground hover:text-primary"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.path}
                    href={href}
                    className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 ${pathname === item.path
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                      }`}
                  >
                    {pathname === item.path && (
                      <motion.div
                        layoutId="underline"
                        className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary"
                      />
                    )}
                    {item.label}
                  </Link>
                );
              })}


              {/* Donate Button */}
              {/* <a 
                href={process.env.NODE_ENV === 'development' ? 'http://donate.localhost:3000' : 'https://donate.'+process.env.NEXT_PUBLIC_HOSTNAME}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1"
              >
                ❤️ Donate Now
              </a> */}

              {/* Auth Status */}
              {isAuthenticated && user && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Hi, {user.name || user.email}</span>
                  {/* <button onClick={() => signOut()} className="ml-2 text-xs text-primary underline">Logout</button> */}
                </div>
              )}

              {/* Cart Button */}
              <button
                onClick={() => openCart()}
                aria-label="Shopping cart"
                className="cart-button relative p-2 rounded-md text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center"
                  >
                    {totalQuantity}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => openCart()}
                aria-label="Shopping cart"
                className="cart-button relative p-2 rounded-md text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={22} />
                {totalQuantity > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1 min-w-5 h-5 flex items-center justify-center"
                  >
                    {totalQuantity}
                  </motion.span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Shopping cart"
                className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
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
          className="lg:hidden overflow-hidden bg-background border-b border-border"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              // If on donate subdomain, link to main domain
              const href = isDonateDomain ? `${mainDomainUrl}${item.path}` : item.path;
              const isExternal = isDonateDomain;
              
              return isExternal ? (
                <a
                  key={item.path}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition-colors text-muted-foreground hover:text-primary hover:bg-accent"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.path}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${pathname === item.path
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-primary hover:bg-accent"
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Donate Button */}
            <a 
              href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/donate' : 'https://donate.maceazy.com'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block mx-3 my-2 px-4 py-2 text-center text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full hover:from-rose-600 hover:to-pink-700 transition-all duration-200 shadow-md"
            >
              ❤️ Donate Now
            </a>

            {/* Mobile Auth Status */}
            {isAuthenticated && user && (
              <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border">
                Welcome, {user.name || user.email}
                <button onClick={() => signOut()} className="ml-2 text-xs text-primary underline">Logout</button>
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
            className="cart-drawer relative w-full sm:w-96 bg-card h-full shadow-2xl flex flex-col z-10 border-l border-border"
          >
            {/* Header with Enhanced Close Button */}
            <div className="p-4 flex justify-between items-center border-b border-border bg-accent/50">
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-lg font-semibold text-foreground"
              >
                My Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'})
              </motion.h2>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-accent transition-all"
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
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground mb-4">Please login to view your cart</p>
                  <button
                    onClick={() => { signIn(); closeCart(); }}
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </button>
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your cart...</p>
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
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  </motion.div>
                  <p className="text-muted-foreground">Your cart is empty</p>
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-4 py-2 text-primary hover:bg-accent rounded-lg transition-all"
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
                        className="flex items-center gap-4 border border-border rounded-lg p-3 bg-card shadow-sm hover:shadow-md transition-all relative overflow-hidden"
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
                          <h3 className="font-medium text-foreground line-clamp-1">
                            {item.name || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-muted-foreground">₹{item.price || 0}</p>

                          {/* Stock Information */}
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.stock <= 5 ? (
                              <span className="text-[oklch(0.75_0.15_70)] font-medium">
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
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full bg-accent hover:bg-accent/80 transition-all"
                            >
                              <Minus size={14} />
                            </motion.button>

                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="min-w-8 text-center font-medium text-foreground"
                            >
                              {item.quantity || 0}
                            </motion.span>

                            <motion.button
                              onClick={() => increaseQty(item.productId)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1.5 rounded-full bg-accent hover:bg-accent/80 transition-all"
                              title={item.quantity >= item.stock ? `Stock limit reached (${item.stock})` : ''}
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                        </div>

                        {/* Enhanced Delete Button */}
                        <motion.button
                          onClick={() => removeItem(item.productId)}
                          whileHover={{ scale: 1.1, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-destructive hover:text-destructive/80 p-2 rounded-full hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </motion.button>

                        {/* ...existing code... */}
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
                className="border-t border-border bg-accent/30 p-4"
              >
                {/* Price Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Items ({totalQuantity}):</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg text-foreground">
                    <span>Total:</span>
                    <motion.span
                      key={totalPrice}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-primary"
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
                  className="w-full bg-gradient-to-r from-primary to-[oklch(0.35_0.08_230)] text-primary-foreground py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden"
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
