'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity: number, productDetails: Omit<CartItem, 'productId' | 'quantity'>) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
  initialCart?: CartItem[];
}

export function CartProvider({ children, initialCart = [] }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(!!initialCart.length);
  const [isFetching, setIsFetching] = useState(false);
  const { isAuthenticated } = useAuth();
  const [pendingSync, setPendingSync] = useState<Array<{
    id: string;
    action: 'add' | 'remove' | 'update';
    productId: string;
    quantity?: number;
    productDetails?: Omit<CartItem, 'productId' | 'quantity'>;
    timestamp: number;
  }>>([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const fetchCart = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetching) {
      console.log('Cart fetch already in progress, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      setIsLoading(true);
      
      const response = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Cart API response:', data); // Debug log
        
        // Transform server cart data to match our CartItem interface
        const cartItems: CartItem[] = data.items?.map((item: {
          productId: {
            _id: string;
            name: string;
            price: number;
            image: string;
            stock: number;
          };
          quantity: number;
        }) => ({
          productId: item.productId._id,
          quantity: item.quantity,
          name: item.productId.name,
          price: item.productId.price,
          image: item.productId.image,
          stock: item.productId.stock,
        })) || [];

        console.log('Transformed cart items:', cartItems); // Debug log
        setCart(cartItems);
        
        // Also update localStorage with error handling
        if (isHydrated) {
          try {
            const cartData = JSON.stringify(cartItems);
            if (cartData.length < 1024 * 1024) { // Less than 1MB
              localStorage.setItem('cart', cartData);
            } else {
              console.warn('Cart data too large for localStorage in fetchCart');
            }
          } catch (localStorageError) {
            console.error('Failed to save fetched cart to localStorage:', localStorageError);
          }
        }
      } else {
        console.error('Failed to fetch cart from server, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [isHydrated, isFetching]);

  const mergeCartItems = (serverCart: CartItem[], localCart: CartItem[]): CartItem[] => {
    const merged = [...serverCart];
    
    localCart.forEach(localItem => {
      const existingIndex = merged.findIndex(item => item.productId === localItem.productId);
      if (existingIndex >= 0) {
        // Take the higher quantity (user preference)
        merged[existingIndex].quantity = Math.max(merged[existingIndex].quantity, localItem.quantity);
      } else {
        merged.push(localItem);
      }
    });
    
    return merged;
  };

  // Hydration effect - handle client-side cart merging
  useEffect(() => {
    const hydrateCart = () => {
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart) as CartItem[];
          
          // If we have server cart and local cart, merge them intelligently
          if (initialCart.length > 0 && parsedCart.length > 0) {
            const mergedCart = mergeCartItems(initialCart, parsedCart);
            setCart(mergedCart);
            // Don't save during hydration - let the persistence effect handle it
          } else if (parsedCart.length > 0 && initialCart.length === 0) {
            // Only local cart exists
            setCart(parsedCart);
          }
          // If only server cart exists, it's already set in initial state
        }
      } catch (error) {
        console.error('Failed to hydrate cart from localStorage:', error);
        // Clear corrupted data
        try {
          localStorage.removeItem('cart');
        } catch (e) {
          console.error('Failed to clear corrupted cart data:', e);
        }
      }
      setIsHydrated(true);
    };

    // Only run once on mount
    if (!isHydrated) {
      hydrateCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Auto-sync pending items when online
  useEffect(() => {
    const syncPendingItems = async () => {
      if (navigator.onLine && pendingSync.length > 0) {
        const itemsToSync = [...pendingSync]; // Create a copy to avoid state mutation
        
        for (const item of itemsToSync) {
          try {
            await syncCartAction(item);
            setPendingSync(prev => prev.filter(i => i.id !== item.id));
          } catch (error) {
            console.error('Failed to sync cart item:', error);
            // Keep in pending queue for retry
            break; // Stop syncing if one fails
          }
        }
      }
    };

    const handleOnline = () => {
      syncPendingItems();
    };

    window.addEventListener('online', handleOnline);
    
    // Also try sync immediately if online and there are pending items
    if (navigator.onLine && pendingSync.length > 0) {
      // Use setTimeout to avoid blocking the render
      setTimeout(syncPendingItems, 100);
    }

    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only depend on pendingSync.length would cause infinite re-renders

  // Persist cart to localStorage whenever it changes (but not during hydration)
  useEffect(() => {
    if (isHydrated) {
      try {
        const cartData = JSON.stringify(cart);
        // Check if the data is reasonable in size (less than 1MB)
        if (cartData.length < 1024 * 1024) {
          localStorage.setItem('cart', cartData);
        } else {
          console.warn('Cart data too large for localStorage, skipping save');
          // Store only essential cart info
          const minimalCart = cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            name: item.name.substring(0, 50), // Limit name length
            price: item.price,
            stock: item.stock,
            image: item.image.substring(0, 200) // Limit image URL length
          }));
          localStorage.setItem('cart', JSON.stringify(minimalCart));
        }
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
        // Clear localStorage if it's full
        try {
          localStorage.removeItem('cart');
        } catch (e) {
          console.error('Failed to clear cart from localStorage:', e);
        }
      }
    }
  }, [cart, isHydrated]);

  // Fetch cart from server when user is authenticated and hydration is complete
  useEffect(() => {
    if (isAuthenticated && isHydrated && !hasInitialFetch && !isFetching) {
      console.log('Auto-fetching cart for authenticated user'); // Debug log
      setHasInitialFetch(true);
      fetchCart().catch(error => {
        console.error('Failed to fetch initial cart:', error);
        setHasInitialFetch(false); // Reset on error so it can retry
      });
    }
  }, [isAuthenticated, isHydrated, hasInitialFetch, isFetching, fetchCart]);

  const syncCartAction = async (action: {
    action: 'add' | 'remove' | 'update';
    productId: string;
    quantity?: number;
    productDetails?: Omit<CartItem, 'productId' | 'quantity'>;
  }) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        action: action.action,
        productId: action.productId,
        quantity: action.quantity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Cart sync failed');
    }

    return response.json();
  };

  const addToCart = async (
    productId: string, 
    quantity: number, 
    productDetails: Omit<CartItem, 'productId' | 'quantity'>
  ) => {
    setIsLoading(true);
    
    try {
      // STRICT STOCK VALIDATION
      const existingItem = cart.find(item => item.productId === productId);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      const newTotalQuantity = currentQuantity + quantity;
      
      // Check if adding this quantity would exceed stock
      if (newTotalQuantity > productDetails.stock) {
        const available = Math.max(0, productDetails.stock - currentQuantity);
        if (available === 0) {
          toast.error(`All ${productDetails.stock} items are already in your cart`);
        } else {
          toast.error(`Only ${available} more item${available > 1 ? 's' : ''} can be added. Stock limit: ${productDetails.stock}`);
        }
        setIsLoading(false);
        return;
      }

      // Additional safety check - never allow quantity to exceed stock
      if (quantity <= 0 || newTotalQuantity <= 0) {
        toast.error('Invalid quantity');
        setIsLoading(false);
        return;
      }

      console.log(`Adding to cart - Product: ${productDetails.name}, Current: ${currentQuantity}, Adding: ${quantity}, New Total: ${newTotalQuantity}, Stock: ${productDetails.stock}`);

      // Optimistic update with strict validation
      const newItem: CartItem = { productId, quantity, ...productDetails };
      setCart(prevCart => {
        const existingIndex = prevCart.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
          const updatedCart = [...prevCart];
          const updatedQuantity = updatedCart[existingIndex].quantity + quantity;
          
          // Ensure we don't exceed stock but don't throw error in state update
          if (updatedQuantity > productDetails.stock) {
            console.warn('Attempted to exceed stock limit, capping at max stock');
            updatedCart[existingIndex].quantity = productDetails.stock;
            return updatedCart;
          }
          
          updatedCart[existingIndex].quantity = updatedQuantity;
          return updatedCart;
        } else {
          // For new items, ensure quantity doesn't exceed stock
          if (quantity > productDetails.stock) {
            console.warn('Initial quantity exceeds stock, capping at max stock');
            return [...prevCart, { ...newItem, quantity: productDetails.stock }];
          }
          return [...prevCart, newItem];
        }
      });

      // Sync with server
      if (navigator.onLine) {
        await syncCartAction({ action: 'add', productId, quantity, productDetails });
        toast.success('Item added to cart!');
      } else {
        // Queue for later sync
        setPendingSync(prev => [...prev, {
          id: `${Date.now()}-${productId}`,
          action: 'add',
          productId,
          quantity,
          productDetails,
          timestamp: Date.now(),
        }]);
        toast.success('Item added to cart (will sync when online)');
      }
    } catch (error) {
      // Revert optimistic update
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
      toast.error(errorMessage);
      
      // Queue for retry if it's a network error
      if (error instanceof Error && error.message.includes('fetch')) {
        setPendingSync(prev => [...prev, {
          id: `${Date.now()}-${productId}`,
          action: 'add',
          productId,
          quantity,
          productDetails,
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    setIsLoading(true);
    
    // Store the item before removing for potential rollback
    const removedItem = cart.find(item => item.productId === productId);
    
    try {
      // Optimistic update
      setCart(prevCart => prevCart.filter(item => item.productId !== productId));

      // Sync with server
      if (navigator.onLine) {
        await syncCartAction({ action: 'remove', productId });
        toast.success('Item removed from cart');
      } else {
        setPendingSync(prev => [...prev, {
          id: `${Date.now()}-${productId}`,
          action: 'remove',
          productId,
          timestamp: Date.now(),
        }]);
        toast.success('Item removed (will sync when online)');
      }
    } catch (error) {
      // Revert optimistic update
      if (removedItem) {
        setCart(prevCart => [...prevCart, removedItem]);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

  // Do not set global loading for quantity update
    
    // Store old quantity for potential rollback
    const cartItem = cart.find(item => item.productId === productId);
    const oldQuantity = cartItem?.quantity || 0;
    
    // STRICT STOCK VALIDATION
    if (cartItem && quantity > cartItem.stock) {
      toast.error(`Only ${cartItem.stock} items available in stock`);
  // No global loading
      return;
    }
    
    try {
      // Optimistic update with strict stock enforcement
      setCart(prevCart => 
        prevCart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: Math.min(quantity, item.stock) } // Ensure never exceeds stock
            : item
        )
      );

      // Sync with server
      if (navigator.onLine) {
        await syncCartAction({ action: 'update', productId, quantity: Math.min(quantity, cartItem?.stock || quantity) });
        toast.success('Quantity updated!');
      } else {
        setPendingSync(prev => [...prev, {
          id: `${Date.now()}-${productId}`,
          action: 'update',
          productId,
          quantity: Math.min(quantity, cartItem?.stock || quantity),
          timestamp: Date.now(),
        }]);
        toast.success('Quantity updated (will sync when online)');
      }
    } catch (error) {
      // Revert optimistic update
      setCart(prevCart => 
        prevCart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: oldQuantity }
            : item
        )
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
      toast.error(errorMessage);
    } finally {
  // No global loading
    }
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
    setPendingSync([]);
  };

  // Show loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <CartContext.Provider value={{
        cart: [],
        cartCount: 0,
        isLoading: true,
        addToCart: async () => {},
        removeFromCart: async () => {},
        updateQuantity: async () => {},
        clearCart: () => {},
        fetchCart: async () => {},
        isHydrated: false,
      }}>
        {children}
      </CartContext.Provider>
    );
  }

  return (
    <CartContext.Provider value={{
      cart,
      cartCount,
      isLoading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart,
      isHydrated,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
