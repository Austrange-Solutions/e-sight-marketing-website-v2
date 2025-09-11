'use client';

import React, { useState, useCallback } from 'react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Eye, Heart, Star, Filter, Search } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  stock: number;
  status: 'active' | 'inactive';
  featured: boolean;
}

interface ProductGridProps {
  products: Product[];
  pageSize?: number;
  title?: string;
  showFilters?: boolean;
}

export default function ProductGrid({ 
  products,
  title = "Our Products",
  showFilters = true,
  pageSize = 12
}: ProductGridProps) {
  const { addToCart, isLoading } = useCart();
  
  // State for filtering and searching
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('name');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter and sort products
  React.useEffect(() => {
  let filtered = products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      const isActive = product.status === 'active' && product.stock > 0;
      
      return matchesCategory && matchesSearch && matchesPrice && isActive;
    });

    // Sort products
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
    setPage(1);
    setVisibleProducts(filtered.slice(0, pageSize));
  }, [products, selectedCategory, searchTerm, priceRange, sortBy]);

  // Lazy loading: load more products when scrolling near bottom
  const loaderRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!loaderRef.current) return;
    const handleScroll = () => {
      if (loading) return;
      const rect = loaderRef.current!.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        setLoading(true);
        setTimeout(() => {
          setPage(prev => {
            const nextPage = prev + 1;
            setVisibleProducts(filteredProducts.slice(0, nextPage * pageSize));
            setLoading(false);
            return nextPage;
          });
        }, 800); // simulate network delay
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredProducts, loading, pageSize]);
  // Handle add to cart with error handling
  const handleAddToCart = useCallback(async (product: Product) => {
    try {
      const productDetails = {
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock
      };
      
      await addToCart(product._id, 1, productDetails);
      setNotification({
        message: `${product.name} has been added to your cart`,
        type: 'success'
      });
      
      // Auto-hide notification
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: error instanceof Error ? error.message : "Failed to add item to cart",
        type: 'error'
      });
      
      // Auto-hide notification
      setTimeout(() => setNotification(null), 5000);
    }
  }, [addToCart]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our curated collection of high-quality products
        </p>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Max Price: ${priceRange.max}</label>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Product Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Filter className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onAddToCart={handleAddToCart}
                isAddingToCart={isLoading}
              />
            ))}
            {/* Skeletons for loading */}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        )}
        {/* Loader div for intersection */}
        <div ref={loaderRef} style={{ height: 1 }} />
      </AnimatePresence>

    </div>
  );
}


// Skeleton Card Component
export function SkeletonCard() {
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

// Individual Product Card Component
interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => Promise<void>;
  isAddingToCart: boolean;
}

function ProductCard({ product, index, onAddToCart, isAddingToCart }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={imageError ? '/placeholder-product.jpg' : product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
        
        {/* Overlay Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center gap-2"
            >
              <Link href={`/products/${product._id}`}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 text-gray-700" />
                </motion.button>
              </Link>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
              >
                <Heart className="h-4 w-4 text-gray-700" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
            Only {product.stock} left
          </div>
        )}

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Featured
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isAddingToCart || product.stock === 0}
            onClick={() => onAddToCart(product)}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isAddingToCart ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="mt-2 text-center text-red-600 text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>
    </motion.div>
  );
}
