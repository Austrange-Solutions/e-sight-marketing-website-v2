
'use client';
import React, { useEffect, useState, useRef } from 'react';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 9;

type Product = {
  _id: string;
  // add other product fields as needed, e.g. name, price, etc.
  [key: string]: any;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchBatch(page);
    // eslint-disable-next-line
  }, [page]);

  async function fetchBatch(pageNum: number) {
    setLoading(true);
    const res = await fetch(`/api/products?page=${pageNum}&limit=${PAGE_SIZE}`);
    const data = await res.json();
    if (data.products && data.products.length > 0) {
      setProducts(prev => {
        // Prevent duplicates by _id
        const existingIds = new Set(prev.map(p => p._id));
        const newProducts = data.products.filter((p: Product) => !existingIds.has(p._id));
        return [...prev, ...newProducts];
      });
      setHasMore(data.products.length === PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!hasMore || loading) return;
    const handleScroll = () => {
      if (!loaderRef.current) return;
      const rect = loaderRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading]);

  return (
    <div className="mt-[5%] min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 lg:py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 md:mb-12 text-center text-gray-900">Our Products</h1>
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {products.map((product: any) => (
              <ProductCard 
                key={product._id} 
                product={product} 
              />
            ))}
            {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
        <div ref={loaderRef} style={{ height: 1 }} />
        {!loading && products.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-base sm:text-lg">No products available</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-8 w-8 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
