'use client';
import { useState } from 'react';

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

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to cart");

      alert("Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });

      if (!cartRes.ok) throw new Error("Failed to add to cart");

      // Then redirect to checkout
      window.location.href = "/checkout";
    } catch (error) {
      console.error("Error proceeding to checkout:", error);
      alert("Failed to proceed to checkout");
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
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full w-full max-w-sm relative overflow-hidden ${isOutOfStock ? 'bg-gray-100' : ''}`}>
      {/* Type Badge - Top left for out of stock, or stock status for in stock */}
      <div className="absolute top-4 left-4 z-10">
        {isOutOfStock ? (
          <span className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm font-medium">
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </span>
        ) : (
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            In Stock
          </span>
        )}
      </div>

      {/* Heart Icon - Top right */}
      <div className="absolute top-4 right-4 z-10">
        <button className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.682l-1.318-1.364a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Out of Stock Overlay - Large red badge in center */}
      {isOutOfStock && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg">
            OUT OF STOCK
          </div>
        </div>
      )}

      {/* Image Section - Further increased height */}
      <div className={`relative w-full h-96 ${isOutOfStock ? 'filter grayscale opacity-70' : ''}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex mr-2">
            {renderStars()}
          </div>
          <span className="text-gray-500 text-sm">({rating.toFixed(1)}) • 128 reviews</span>
        </div>

        {/* Stock Status Text */}
        <div className="text-center mb-4">
          {isOutOfStock ? (
            <div className="flex items-center justify-center text-red-500 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Out of Stock
            </div>
          ) : (
            <div className="flex items-center justify-center text-green-500 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              In Stock
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-blue-600">₹{product.price.toLocaleString()}</div>
        </div>

        {/* Key Features */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-left">Key Features:</h4>
          <ul className="space-y-1 text-left">
            {product.details.slice(0, 6).map((point, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Quantity Selector - Only for in-stock items */}
        {!isOutOfStock && (
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="text-xl font-bold text-gray-900 min-w-[2rem] text-center">{quantity}</span>
            <button
              onClick={handleIncrement}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        )}

        {/* Stock Warning */}
        {!isOutOfStock && product.stock <= 5 && (
          <div className="text-orange-500 text-sm font-medium text-center mb-4">
            Only {product.stock} left in stock!
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="p-6 pt-0 space-y-3">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : (
          <>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-70"
            >
              {isAdding ? "Adding..." : `Add to Cart • ₹${(quantity * product.price).toLocaleString()}`}
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-70"
            >
              {isAdding ? "Processing..." : "Buy Now"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}