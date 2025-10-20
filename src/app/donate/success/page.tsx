"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Heart, Share2, Download, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface DonationData {
  _id: string;
  donorName: string;
  email: string;
  amount: number;
  sticksEquivalent: number;
  paymentId: string;
  orderId: string;
  createdAt: string;
}

function DonationSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [donationData, setDonationData] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    const orderId = searchParams.get("order_id");

    if (!paymentId || !orderId) {
      router.push("/donate");
      return;
    }

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Fetch donation details
    fetchDonationDetails(paymentId, orderId);
  }, [searchParams, router]);

  const fetchDonationDetails = async (paymentId: string, orderId: string) => {
    try {
      const response = await fetch(
        `/api/donate/details?payment_id=${paymentId}&order_id=${orderId}`
      );
      if (response.ok) {
        const data = await response.json();
        setDonationData(data.donation);
      }
    } catch (error) {
      console.error("Error fetching donation details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "I just donated to help blind people!",
          text: `I donated ${donationData?.sticksEquivalent.toFixed(1)} E-Kaathi Pro smart canes to empower visually impaired individuals. Join me in making a difference!`,
          url: window.location.origin + "/donate",
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    }
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement PDF receipt generation
    alert("Receipt download feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Processing your donation...</p>
        </div>
      </div>
    );
  }

  if (!donationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg mb-4">Failed to load donation details</p>
          <Link
            href="/donate"
            className="text-primary hover:underline flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Donate
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-primary/5 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Success Card */}
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-2xl text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Thank You for Your Generosity!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Your donation has been received successfully. You are making a real difference in
              the lives of visually impaired individuals.
            </p>

            {/* Donation Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Your Impact</h2>
              </div>
              <div className="text-5xl font-bold text-primary mb-2">
                ₹{donationData.amount.toLocaleString("en-IN")}
              </div>
              <div className="text-xl text-foreground font-semibold">
                {donationData.sticksEquivalent < 1
                  ? "Contributing towards E-Kaathi Pro"
                  : `${donationData.sticksEquivalent.toFixed(1)} E-Kaathi Pro ${
                      donationData.sticksEquivalent === 1 ? "Stick" : "Sticks"
                    }`}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {donationData.sticksEquivalent >= 1
                  ? `Your donation will provide ${
                      donationData.sticksEquivalent < 1.5 ? "a" : Math.floor(donationData.sticksEquivalent)
                    } smart cane${Math.floor(donationData.sticksEquivalent) > 1 ? "s" : ""} to visually impaired ${
                      Math.floor(donationData.sticksEquivalent) > 1 ? "individuals" : "person"
                    }`
                  : "Your contribution brings us closer to providing E-Kaathi Pro to someone in need"}
              </p>
            </div>

            {/* Donation Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Donor Name</p>
                <p className="font-semibold text-foreground">{donationData.donorName}</p>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Payment ID</p>
                <p className="font-semibold text-foreground text-sm break-all">
                  {donationData.paymentId}
                </p>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="font-semibold text-foreground text-sm">{donationData.email}</p>
              </div>
              <div className="bg-accent rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-semibold text-foreground">
                  {new Date(donationData.createdAt).toLocaleString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share Your Impact
              </button>
              <button
                onClick={handleDownloadReceipt}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-foreground border border-border rounded-lg font-semibold hover:bg-accent/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-8">
              A confirmation email has been sent to {donationData.email}
            </p>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Your donation is being processed and will be allocated to our manufacturing
                    partners
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Production</h4>
                  <p className="text-sm text-muted-foreground">
                    E-Kaathi Pro smart canes will be manufactured and quality-tested
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Distribution</h4>
                  <p className="text-sm text-muted-foreground">
                    Smart canes will be distributed to visually impaired individuals through our
                    partner organizations
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Donate Again
            </Link>
            {/* <Link
              href="/products"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-foreground border border-border rounded-lg font-semibold hover:bg-accent/80 transition-colors"
            >
              Visit Our Shop
              <ArrowRight className="w-4 h-4" />
            </Link> */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>}>
      <DonationSuccessContent />
    </Suspense>
  );
}
