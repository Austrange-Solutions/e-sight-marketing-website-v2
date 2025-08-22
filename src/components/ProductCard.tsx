'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import LoginModal from './LoginModal';

interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  type: 'basic' | 'pro' | 'max';
  price: number;
  details: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
}

export default function ProductCard({ product, userId }: { product: Product; userId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Static rating value (you can modify this as needed)
  const rating = 4.5; // Example static rating out of 5

  // Check if product is out of stock
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';
  const maxQuantity = Math.min(product.stock, 10); // Limit to stock or 10, whichever is lower

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

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
    
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      toast.success("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart";
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    
    setIsAdding(true);
    try {
      // First add to cart
      const cartRes = await fetch("/api/cart", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      if (!cartRes.ok) {
        const errorData = await cartRes.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      // Then redirect to checkout
      router.push("/checkout");
      toast.success("Redirecting to checkout...");
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to proceed to checkout";
      toast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  // Function to render star ratings
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full w-full max-w-sm mx-auto relative overflow-hidden ${isOutOfStock ? 'bg-gray-100' : ''}`}>
      {/* Type Badge - Mobile Optimized */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
        {isOutOfStock ? (
          <span className="bg-gray-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium">
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </span>
        ) : (
          <span className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
            In Stock
          </span>
        )}
      </div>

      {/* Heart Icon - Mobile Optimized */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
        <button className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Out of Stock Overlay - Mobile Optimized */}
      {isOutOfStock && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-red-500 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold text-sm sm:text-lg shadow-lg">
            OUT OF STOCK
          </div>
        </div>
      )}

      {/* Image Section - Mobile Optimized */}
      <div className={`relative w-full h-64 sm:h-80 md:h-96 ${isOutOfStock ? 'filter grayscale opacity-70' : ''}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Content Section - Mobile Optimized */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-grow">
        {/* Product Name - Mobile Optimized */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 text-center line-clamp-2">{product.name}</h3>
        
        {/* Rating - Mobile Optimized */}
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="flex mr-2">
            {renderStars()}
          </div>
          <span className="text-gray-500 text-xs sm:text-sm">({rating.toFixed(1)}) • 128 reviews</span>
        </div>

        {/* Stock Status Text - Mobile Optimized */}
        <div className="text-center mb-3 sm:mb-4">
          {isOutOfStock ? (
            <div className="flex items-center justify-center text-red-500 font-medium text-sm">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Out of Stock
            </div>
          ) : (
            <div className="flex items-center justify-center text-green-500 font-medium text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              In Stock
            </div>
          )}
        </div>

        {/* Price - Mobile Optimized */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</div>
        </div>

        {/* Key Features - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-left text-sm sm:text-base">Key Features:</h4>
          <ul className="space-y-1 text-left">
            {product.details.slice(0, 4).map((point, index) => (
              <li key={index} className="flex items-start text-xs sm:text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                <span className="line-clamp-2">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity Selector - Mobile Optimized */}
        {!isOutOfStock && (
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              -
            </button>
            <span className="text-lg sm:text-xl font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              +
            </button>
          </div>
        )}

        {/* Stock Warning - Mobile Optimized */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="text-orange-500 text-xs sm:text-sm font-medium text-center mb-3 sm:mb-4">
            Only {product.stock} left in stock!
          </div>
        )}
      </div>

      {/* Bottom Buttons - Mobile Optimized */}
      <div className="p-3 sm:p-4 md:p-6 pt-0 space-y-2 sm:space-y-3">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full bg-gray-500 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold cursor-not-allowed text-sm sm:text-base"
          >
            Out of Stock
          </button>
        ) : (
          <>
            <button
              onClick={() => checkAuthAndProceed(handleAddToCart, 'add item to cart')}
              disabled={isAdding || authLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-70 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAdding ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5L7 13m0 0l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  Add to Cart • ₹{(quantity * product.price).toLocaleString()}
                </span>
              )}
            </button>
            <button 
              onClick={() => checkAuthAndProceed(handleBuyNow, 'purchase this item')}
              disabled={isAdding || authLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-70 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isAdding ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </span>
              )}
            </button>
          </>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginMessage}
      />
    </div>
  );
}