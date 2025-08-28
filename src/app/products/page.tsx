import ProductCard from '@/components/ProductCard';
import { getProducts, ServerProduct } from '@/lib/server/products';

// Server Component - No 'use client' directive
export default async function ProductsPage() {
  // Server-side data fetching
  const products = await getProducts();

  return (
    <div className="mt-[5%] min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center text-gray-900">Our Products</h1>
        
        {/* Responsive Grid - Wider Cards Coverage */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {products.map((product: ServerProduct) => (
              <ProductCard 
                key={product._id} 
                product={product} 
              />
            ))}
          </div>
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-base sm:text-lg">No products available</div>
          </div>
        )}
      </div>
    </div>
  );
}
