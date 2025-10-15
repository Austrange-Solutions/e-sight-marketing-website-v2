import AddToCartButton from './AddToCartButton';
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  type?: 'basic' | 'pro' | 'max';
  price: number;
  details?: string[];
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  category: string;
}

// Server Component - No 'use client' directive
export default function ProductCard({ product }: { product: Product }) {
  // Static rating value (you can modify this as needed)
  const rating = 4.5; // Example static rating out of 5

  // Check if product is out of stock
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';
  const maxQuantity = product.stock; // Use actual stock as maximum
  
  // Calculate remaining stock (will be refined by client component)
  const remainingStock = maxQuantity;

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
    <Card className={`flex flex-col h-full w-full relative overflow-hidden border-border hover:border-primary transition-all duration-300 transform hover:scale-[1.02] ${isOutOfStock ? 'bg-muted' : ''}`}>
      {/* Type Badge - Mobile Optimized */}
      {product.type && !isOutOfStock && (
        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 z-10">
          <Badge className="bg-primary text-primary-foreground shadow-md">
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </Badge>
        </div>
      )}

      {/* Status Badge - Only show when out of stock */}
      {isOutOfStock && (
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
          <Badge variant="destructive">
            Out of Stock
          </Badge>
        </div>
      )}

      {/* Out of Stock Overlay - Mobile Optimized */}
      {isOutOfStock && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <Badge variant="destructive" className="px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 font-bold text-xs sm:text-sm md:text-base shadow-lg">
            OUT OF STOCK
          </Badge>
        </div>
      )}

      {/* Image Section - Responsive Height */}
      <div className={`relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 ${isOutOfStock ? 'filter grayscale opacity-70' : ''}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain rounded-t-xl sm:rounded-t-2xl"
          loading="lazy"
        />
      </div>

      {/* Content Section - Mobile Optimized */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-grow">
        {/* Product Name - Mobile Optimized */}
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-foreground mb-2 sm:mb-3 text-center line-clamp-2">{product.name}</h3>
        
        {/* Rating - Mobile Optimized */}
        <div className="flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
          <div className="flex mr-2">
            {renderStars()}
          </div>
          <span className="text-muted-foreground text-xs sm:text-sm">({rating.toFixed(1)}) • 128 reviews</span>
        </div>

        {/* Price - Mobile Optimized */}
        <div className="text-center mb-3 sm:mb-4 md:mb-5">
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">₹{product.price.toLocaleString()}</div>
        </div>

        {/* Stock Information - Mobile Optimized */}
        <div className="text-center mb-3 sm:mb-4 md:mb-5">
          <div className={`text-xs sm:text-sm md:text-base font-medium ${
            remainingStock === 0 
              ? 'text-destructive' 
              : remainingStock <= 3 
                ? 'text-[oklch(0.75_0.15_70)]' 
                : 'text-[oklch(0.70_0.15_160)]'
          }`}>
            {remainingStock === 0 
              ? 'Out of Stock'
              : remainingStock <= 5 
                ? `Only ${remainingStock} left in stock!` 
                : `${remainingStock} items in stock`
            }
          </div>
        </div>

        {/* Key Features - Mobile Optimized */}
        <div className="mb-3 sm:mb-4 md:mb-5 flex-grow">
          <h4 className="font-semibold text-foreground mb-2 text-left text-xs sm:text-sm md:text-base">Key Features:</h4>
          <ul className="space-y-1 text-left">
            {product.details && product.details.length > 0 ? product.details.slice(0, 3).map((point, index) => (
              <li key={index} className="flex items-start text-xs sm:text-sm text-muted-foreground">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                <span className="line-clamp-2">{point}</span>
              </li>
            )) : (
              <li className="flex items-start text-xs sm:text-sm text-muted-foreground">
                <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-muted-foreground rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></span>
                <span className="line-clamp-2">No details available</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Buttons - Mobile Optimized - CLIENT COMPONENT */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0">
        <AddToCartButton
          productId={product._id}
          productDetails={{
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
          }}
          maxQuantity={maxQuantity}
          isOutOfStock={isOutOfStock}
        />
      </div>
    </Card>
  );
}