"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Share2,
  ShieldCheck,
  TruckIcon,
  TagIcon,
  CheckCircle2,
  Share,
  Trash2,
} from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { useCart } from "@/contexts/CartContext";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/LoginModal";

interface Product {
  _id: string;
  name: string;
  image: string;
  gallery?: string[]; // Array of gallery image URLs
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
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>("");
  const [commentWordCount, setCommentWordCount] = useState<number>(0);
  const maxCommentWords = 150;
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

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

  useEffect(() => {
    if (!id) return;
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch(`/api/products/${id}/reviews`);
      if (!res.ok) return setReviews([]);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error("Failed to fetch reviews", e);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const { addToCart } = useCart();

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setLoginMessage("Please login to buy this product");
      setShowLoginModal(true);
      return;
    }

    try {
      // add one item then navigate to checkout
      await addToCart(product!._id, 1, {
        name: product!.name,
        price: product!.price,
        image: product!.image,
        stock: product!.stock,
      });
      window.location.href = "/checkout";
    } catch (e) {
      console.error("Buy now failed", e);
      toast.error("Failed to proceed to checkout");
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setLoginMessage("Please login to submit a review");
      setShowLoginModal(true);
      return;
    }
    if (newRating < 1) {
      toast.error("Please select a rating");
      return;
    }
    if (!newComment || newComment.trim().length < 3) {
      toast.error("Please write a longer review");
      return;
    }
    if (commentWordCount > maxCommentWords) {
      toast.error(`Review must be ${maxCommentWords} words or less`);
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit review");
      }
      const data = await res.json();
      // prepend the new review
      setReviews((prev) => [data.review, ...prev]);
      setNewComment("");
      setNewRating(0);
      setCommentWordCount(0);
      toast.success("Review submitted");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      setLoginMessage("Please login to delete your review");
      setShowLoginModal(true);
      return;
    }
    try {
      setDeletingReviewId(reviewId);
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete review");
      }
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted");
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || "Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ₹${product.price.toLocaleString()}`,
      url: window.location.href,
    };

    try {
      // Try Web Share API first (mobile and some desktop browsers)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Product shared successfully");
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      // User cancelled share or clipboard failed
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
        toast.error("Failed to share product");
      }
    }
  };

  // Compute a recency-weighted average rating from reviews.
  // More recent reviews carry higher weight. We use an exponential decay with a half-life.
  // weight = 0.5^(ageDays / halfLifeDays)
  const computeWeightedAverage = (
    reviewsList: any[],
    halfLifeDays = 30,
    fallback = 0
  ) => {
    const v = reviewsList ? reviewsList.length : 0;
    if (v === 0) return fallback;
    const now = Date.now();
    let weightedSum = 0;
    let weightTotal = 0;
    for (const r of reviewsList) {
      const ratingVal = Number(r.rating) || 0;
      let weight = 1;
      if (r && r.createdAt) {
        const created = new Date(r.createdAt).getTime();
        const ageDays = Math.max(0, (now - created) / (1000 * 60 * 60 * 24));
        weight = Math.pow(0.5, ageDays / halfLifeDays);
      }
      weightedSum += ratingVal * weight;
      weightTotal += weight;
    }
    return weightTotal > 0 ? weightedSum / weightTotal : fallback;
  };

  // Choose half-life (in days) for recency — tweakable. Fallback uses product rating or 0.
  const halfLifeDays = 30;
  const fallbackRating = (product?.rating as number | undefined) ?? 0;
  const weightedRating = computeWeightedAverage(
    reviews,
    halfLifeDays,
    fallbackRating
  );
  const rating = Number.isFinite(weightedRating)
    ? weightedRating
    : fallbackRating;

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-4 h-4 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <defs>
            <linearGradient
              id="half-star-detail"
              x1="0"
              x2="100%"
              y1="0"
              y2="0"
            >
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill="url(#half-star-detail)"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
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
        <p className="text-destructive text-lg">
          {error || "Product not found"}
        </p>
        <Link
          href="/products"
          className="text-primary hover:underline inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0 || product.status === "out_of_stock";

  // Use gallery images from database, with main image as fallback
  const galleryImages = [
    product?.image, // Main image first
    ...(product?.gallery || []), // Add gallery images if they exist
  ].filter(Boolean);

  return (
    <main className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>›</span>
          <Link href="/products" className="hover:text-foreground">
            Products
          </Link>
          <span>›</span>
          {/* <span className="text-foreground">{product.category}</span> */}
          {/* <span>›</span> */}
          <span className="text-foreground line-clamp-1">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 items-start">
          {/* Left Column - Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:sticky lg:top-24 lg:self-start">
            {/* Vertical Thumbnail Carousel - Horizontal on Mobile */}
            {galleryImages.length > 1 && (
              <div className="flex flex-row lg:flex-col gap-2 order-2 lg:order-1 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:h-96 lg:pr-1 pb-2 lg:pb-0">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index
                        ? "border-primary shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 space-y-3 sm:space-y-4 order-1 lg:order-2">
              <div className="relative bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 lg:p-8 overflow-hidden group">
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-background transition-colors cursor-pointer"
                  aria-label="Share product"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </button>

                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm sm:text-base lg:text-xl bg-destructive px-4 py-2 sm:px-6 sm:py-3 rounded-lg">
                      OUT OF STOCK
                    </span>
                  </div>
                )}

                <div
                  className={`relative h-64 sm:h-80 lg:h-96 flex items-center justify-center ${isOutOfStock ? "filter grayscale opacity-70" : ""}`}
                >
                  <Image
                    src={galleryImages[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
                  />
                </div>
              </div>

              {/* Action Buttons Below Image */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                  <AddToCartButton
                    productId={product._id}
                    productDetails={{
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      stock: product.stock,
                    }}
                    maxQuantity={product.stock}
                    isOutOfStock={isOutOfStock}
                  />
                </div>

                <div className="flex-1">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="w-full bg-accent hover:bg-accent/80 disabled:bg-muted disabled:cursor-not-allowed text-accent-foreground font-bold py-2.5 sm:py-3 px-4 rounded-lg transition-colors border border-primary text-sm sm:text-base"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2 sm:mb-3 leading-tight">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* Rating Section */}
            {rating > 0 && (
              <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-t border-b border-border">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-600 text-white rounded-md">
                  <span className="font-semibold text-sm sm:text-base">
                    {rating.toFixed(1)}
                  </span>
                  <svg className="w-3 h-3 fill-white" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <button
                  onClick={() => {
                    const reviewsSection =
                      document.getElementById("reviews-section");
                    reviewsSection?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Ratings & Reviews
                </button>
              </div>
            )}

            {/* Price Section */}
            <div className="py-3 sm:py-4 border-b border-border">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
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
                <h3 className="font-semibold text-foreground mb-4">
                  Key Features
                </h3>
                <div className="space-y-3">
                  {product.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <div className="py-4 border-b border-border">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">
                    Category:
                  </span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div
              id="reviews-section"
              className="py-4 sm:py-6 border-t border-border scroll-mt-20"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold">Reviews</h3>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>

              {reviewsLoading ? (
                <p className="text-muted-foreground">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground">
                  No reviews yet. Be the first to review.
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.map((r: any) => {
                    const canDelete =
                      isAuthenticated &&
                      ((r.user &&
                        session?.user?.id &&
                        String(r.user) === String(session.user.id)) ||
                        (session?.user?.email &&
                          r.username === session.user.email) ||
                        (session?.user?.name &&
                          r.username === session.user.name));
                    console.log("Review delete check:", {
                      reviewId: r._id,
                      reviewUser: r.user,
                      sessionUserId: session?.user?.id,
                      reviewUsername: r.username,
                      sessionEmail: session?.user?.email,
                      sessionName: session?.user?.name,
                      canDelete,
                    });
                    return (
                      <div
                        key={r._id}
                        className="bg-card p-3 sm:p-4 rounded-lg border border-border"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-sm sm:text-base">
                              {r.username}
                            </div>
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(r._id)}
                                disabled={deletingReviewId === r._id}
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded border border-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Delete review"
                                title={
                                  deletingReviewId === r._id
                                    ? "Deleting..."
                                    : "Delete review"
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-2">
                            <div className="flex mr-2">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <svg
                                  key={i}
                                  className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span>
                              • {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {r.comment}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 sm:mt-6">
                {isAuthenticated ? (
                  <form onSubmit={submitReview} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="text-xs sm:text-sm font-medium">
                        Your Rating:
                      </label>
                      <div
                        className="flex items-center gap-1"
                        role="radiogroup"
                        aria-label="Select rating"
                      >
                        {[1, 2, 3, 4, 5].map((n) => {
                          const filled = n <= newRating;
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setNewRating(n)}
                              aria-label={`${n} star${n > 1 ? "s" : ""}`}
                              className="focus:outline-none"
                            >
                              <svg
                                className={`w-6 h-6 ${filled ? "text-yellow-400" : "text-gray-300"} transition-colors`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs sm:text-sm font-medium">
                          Your Review:
                        </label>
                        <span
                          className={`text-xs sm:text-sm ${
                            commentWordCount > maxCommentWords
                              ? "text-red-600"
                              : commentWordCount > maxCommentWords * 0.9
                        disabled={commentWordCount > maxCommentWords}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed
                              : "text-muted-foreground"
                          }`}
                        >
                          {commentWordCount}/{maxCommentWords} words
                        </span>
                      </div>
                      <textarea
                          setCommentWordCount(0);
                        value={newComment}
                        onChange={(e) => {
                          const text = e.target.value;
                          setNewComment(text);
                          const words = text
                            .trim()
                            .split(/\s+/)
                            .filter((word) => word.length > 0).length;
                          setCommentWordCount(words);
                        }}
                        rows={4}
                        placeholder="Write your review..."
                        className={`w-full border rounded p-2 sm:p-3 text-sm ${
                          commentWordCount > maxCommentWords
                            ? "border-red-500"
                            : "border-border"
                        }`}
                      />
                      {commentWordCount > maxCommentWords && (
                        <p className="text-red-600 text-xs mt-1">
                          Review must be {maxCommentWords} words or less
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm sm:text-base"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewComment("");
                          setNewRating(5);
                        }}
                        className="px-4 py-2 border rounded text-sm sm:text-base"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Please{" "}
                    <Link href="/login" className="text-primary">
                      login
                    </Link>{" "}
                    to write a review.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message={loginMessage}
      />
    </main>
  );
}
