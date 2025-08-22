'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/contexts/AuthContext';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center text-gray-900">Our Products</h1>
        
        {/* Auth Status Banner - Mobile Optimized */}
        {!isAuthenticated && (
          <div className="max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <p className="text-blue-800 font-medium text-sm sm:text-base">
                💡 Please <a href="/login" className="text-blue-600 underline hover:text-blue-700">login</a> to add items to cart and make purchases
              </p>
            </div>
          </div>
        )}
        
        {/* Products Grid - Mobile First Responsive */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                userId={user?._id || ''} 
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