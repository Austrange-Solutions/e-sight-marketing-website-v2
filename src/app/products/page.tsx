'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

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
    return <div className='flex justify-center items-center min-h-screen'>Loading products...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-12 text-center text-gray-900">Our Products</h1>
        
        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} userId={''} />
            ))}
          </div>
        </div>
        
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No products available</div>
          </div>
        )}
      </div>
    </div>
  );
}