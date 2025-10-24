'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

const HomeProductsSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch more products initially to account for filtering
      const response = await fetch('/api/products?limit=10');
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Filter only active products with stock > 0 and limit to 3
      const activeProducts = data.products
        .filter((product: Product) => 
          product.status === 'active' && product.stock > 0
        )
        .slice(0, 3);
      
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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

    return stars;
  };

  if (loading) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Products
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover our range of smart assistance devices
            </p>
          </motion.div>
          
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Products
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover our range of smart assistance devices
            </p>
          </motion.div>
          
          <div className="text-center py-12">
            <div className="text-destructive mb-4">{error}</div>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Our Products
            </h2>
            <p className="text-xl text-muted-foreground">
              Discover our range of smart assistance devices
            </p>
          </motion.div>
          
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No products available at the moment</p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Browse All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Products
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover our range of smart assistance devices
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => {
            const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock';
            const rating = 4.5; // Static rating for now
            
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card border-2 border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 ${
                  isOutOfStock ? 'opacity-70' : 'hover:scale-105'
                }`}
              >
                {/* Product Image */}
                <div className={`relative w-full h-64 ${isOutOfStock ? 'filter grayscale' : ''}`}>
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Image failed to load for ${product.name}:`, product.image);
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/maceazy-logo.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <img
                        src="/assets/images/maceazy-logo.png"
                        alt={product.name}
                        className="w-32 h-32 object-contain opacity-50"
                      />
                    </div>
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Content */}
                <div className="p-6">
                  {/* Product Name */}
                  <h3 className="text-xl font-bold text-foreground mb-2 text-center">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex mr-2">
                      {renderStars(rating)}
                    </div>
                    <span className="text-muted-foreground text-sm">({rating}) • 128 reviews</span>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary">
                      ₹{product.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">/device</div>
                  </div>

                  {/* Key Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                      {product.details && product.details.length > 0 ? (
                        product.details.slice(0, 4).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                            <ArrowRight className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <span className="line-clamp-1">{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-center text-sm text-muted-foreground">
                          <ArrowRight className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                          <span>Product details coming soon</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Browse All Products Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground text-lg font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Browse All Products
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeProductsSection;