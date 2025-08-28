'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import LoginModal from './LoginModal';

interface AddToCartButtonProps {
  productId: string;
  productDetails: {
    name: string;
    price: number;
    image: string;
    stock: number;
  };
  maxQuantity: number;
  isOutOfStock: boolean;
}

export default function AddToCartButton({
  productId,
  productDetails,
  maxQuantity,
  isOutOfStock
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [showQuantityControls, setShowQuantityControls] = useState(false);
  
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addToCart, cart } = useCart();
  
  // Get current quantity of this item in cart
  const itemInCart = cart.find(item => item.productId === productId);
  const currentCartQuantity = itemInCart ? itemInCart.quantity : 0;
  
  // Calculate remaining stock considering cart quantity - STRICT ENFORCEMENT
  const actualRemainingStock = Math.max(0, maxQuantity - currentCartQuantity);
  
  // Check if we can add more to cart - STRICT VALIDATION
  const canAddToCart = actualRemainingStock > 0 && currentCartQuantity < maxQuantity;
  
  // Ensure quantity never exceeds what's available
  const maxAllowedQuantity = Math.max(1, actualRemainingStock);
  const safeQuantity = Math.min(quantity, maxAllowedQuantity);

  // Debug logging for stock validation
  console.log(`Stock Debug - Product: ${productDetails.name}`);
  console.log(`Max Stock: ${maxQuantity}, In Cart: ${currentCartQuantity}, Remaining: ${actualRemainingStock}`);
  console.log(`Selected Quantity: ${quantity}, Safe Quantity: ${safeQuantity}, Can Add: ${canAddToCart}`);

  const handleIncrement = () => {
    const newQuantity = quantity + 1;
    const totalAfterIncrement = currentCartQuantity + newQuantity;
    
    // STRICT CHECK: Never allow total to exceed stock
    if (totalAfterIncrement <= maxQuantity) {
      setQuantity(newQuantity);
    } else {
      const available = Math.max(0, maxQuantity - currentCartQuantity);
      if (available === 0) {
        toast.error(`All ${maxQuantity} items are already in your cart`);
      } else {
        toast.error(`Only ${available} more item${available > 1 ? 's' : ''} can be added to cart`);
      }
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const checkAuthAndProceed = (action: () => void, actionName: string) => {
    if (authLoading) {
      toast.error('Please wait...');
      return;
    }
    
    if (!isAuthenticated) {
      setLoginMessage(`Please login to ${actionName.toLowerCase()}`);
      setShowLoginModal(true);
      return;
    }
    
    action();
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    // STRICT VALIDATION: Check if we can still add items
    const quantityToAdd = showQuantityControls ? safeQuantity : 1;
    const totalAfterAdd = currentCartQuantity + quantityToAdd;
    
    if (totalAfterAdd > maxQuantity) {
      const available = Math.max(0, maxQuantity - currentCartQuantity);
      if (available === 0) {
        toast.error(`All ${maxQuantity} items are already in your cart`);
      } else {
        toast.error(`Only ${available} more item${available > 1 ? 's' : ''} can be added. Stock limit: ${maxQuantity}`);
      }
      return;
    }
    
    setIsAdding(true);
    try {
      // If quantity controls are not shown yet, show them and add 1 item (if available)
      if (!showQuantityControls) {
        setShowQuantityControls(true);
        setQuantity(Math.min(1, actualRemainingStock)); // Ensure we don't exceed stock
      }

      // Use CartContext's addToCart function with strict quantity validation
      await addToCart(productId, quantityToAdd, {
        name: productDetails.name,
        price: productDetails.price,
        image: productDetails.image,
        stock: productDetails.stock,
      });

    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {isOutOfStock || actualRemainingStock === 0 ? (
        <button
          disabled
          className="w-full bg-gray-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-not-allowed text-sm sm:text-base"
        >
          {isOutOfStock ? 'Out of Stock' : 'All Items in Cart'}
        </button>
      ) : showQuantityControls ? (
        /* Quantity Controls with Add to Cart button */
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-gray-100 text-gray-900 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="flex-1 flex items-center justify-center text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg sm:text-xl font-bold py-1"
            >
              -
            </button>
            <span className="flex-1 text-center text-lg sm:text-xl font-bold">{safeQuantity}</span>
            <button
              onClick={handleIncrement}
              disabled={currentCartQuantity + quantity >= maxQuantity || actualRemainingStock <= 0}
              className="flex-1 flex items-center justify-center text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg sm:text-xl font-bold py-1"
              title={currentCartQuantity + quantity >= maxQuantity ? `Stock limit reached (${maxQuantity} max)` : actualRemainingStock <= 0 ? 'No more stock available' : 'Increase quantity'}
            >
              +
            </button>
          </div>
          <button
            onClick={() => checkAuthAndProceed(handleAddToCart, 'add item to cart')}
            disabled={isAdding || authLoading || !canAddToCart || actualRemainingStock < safeQuantity || currentCartQuantity + safeQuantity > maxQuantity}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAdding ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : !canAddToCart || actualRemainingStock < safeQuantity || currentCartQuantity + safeQuantity > maxQuantity ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                Stock Limit Reached ({maxQuantity} max)
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L7 13m0 0l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                Add to Cart • ₹{(safeQuantity * productDetails.price).toLocaleString()}
              </span>
            )}
          </button>
        </div>
      ) : (
        <button
          onClick={() => checkAuthAndProceed(handleAddToCart, 'add item to cart')}
          disabled={isAdding || authLoading || !canAddToCart}
          className="w-full bg-indigo-600  hover:bg-indigo-700  text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAdding ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </span>
          ) : !canAddToCart ? (
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              {actualRemainingStock === 0 && currentCartQuantity > 0 ? 'All Items in Cart' : 'Out of Stock'}
            </span>
          ) : !showQuantityControls ? (
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L7 13m0 0l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Add To Cart
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L7 13m0 0l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Add to Cart • ₹{(quantity * productDetails.price).toLocaleString()}
            </span>
          )}
        </button>
      )}
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginMessage}
      />
    </>
  );
}
