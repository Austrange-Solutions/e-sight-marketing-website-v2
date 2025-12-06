"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, ShieldCheck, TruckIcon, TagIcon, CheckCircle2 } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { Badge } from "@/components/ui/badge";

interface Product {
  _id: string;
  name: string;
  image: string;
  description: string;
  type?: "basic" | "pro" | "max";
  price: number;
  details?: string[];
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  category: string;
  [key: string]: unknown;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct(data.product || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const rating = (product?.rating as number | undefined) ?? 0;

  const renderStars = () => {
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
            <linearGradient id="half-star-detail" x1="0" x2="100%" y1="0" y2="0">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star-detail)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-16 min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive text-lg">{error || "Product not found"}</p>
        <Link href="/products" className="text-primary hover:underline inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || product.status === "out_of_stock";

  return (
    <main className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>›</span>
          <Link href="/products" className="hover:text-foreground">Products</Link>
          <span>›</span>
          {/* <span className="text-foreground">{product.category}</span> */}
          {/* <span>›</span> */}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="relative bg-card rounded-2xl border border-border p-8 overflow-hidden group">
              {/* Wishlist Button */}
              <button className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="text-white font-bold text-xl bg-destructive px-6 py-3 rounded-lg">
                    OUT OF STOCK
                  </span>
                </div>
              )}

              <div className={`relative h-96 flex items-center justify-center ${isOutOfStock ? "filter grayscale opacity-70" : ""}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-auto object-contain max-w-full"
                />
              </div>
            </div>

            {/* Action Buttons Below Image */}
            <div className="flex gap-3">
              <button 
                disabled={isOutOfStock}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-bold py-3 px-4 rounded-lg transition-colors border border-primary"
              >
                Add to Cart
              </button>
              
              <button 
                disabled={isOutOfStock}
                className="flex-1 bg-accent hover:bg-accent/80 disabled:bg-muted disabled:cursor-not-allowed text-accent-foreground font-bold py-3 px-4 rounded-lg transition-colors border border-primary"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
                {product.name}
              </h1>
              
              {product.description && (
                <p className="text-base text-muted-foreground mb-4">{product.description}</p>
              )}
            </div>

            {/* Rating Section */}
            {rating > 0 && (
              <div className="flex items-center gap-4 py-4 border-t border-b border-border">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md">
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">
                  Ratings & Reviews
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className="py-4 border-b border-border">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-bold text-foreground">
                  ₹{product.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="py-4 border-b border-border">
              {!isOutOfStock && (
                <div className="flex items-center gap-2 text-sm">
                  <TruckIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-foreground">
                    In Stock • {product.stock} items available
                  </span>
                </div>
              )}
              {isOutOfStock && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-destructive">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Product Features */}
            {product.details && product.details.length > 0 && (
              <div className="py-4 border-b border-border">
                <h3 className="font-semibold text-foreground mb-4">Key Features</h3>
                <div className="space-y-3">
                  {product.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="py-4 border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">Category:</span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </div>
            )}


          </div>
        </div>

      </div>
    </main>
  );
}
