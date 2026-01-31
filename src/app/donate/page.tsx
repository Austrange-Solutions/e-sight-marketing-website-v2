"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  IndianRupee,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Leaderboard from "@/components/donate/Leaderboard";
import DonationPoolProgress from "@/components/donate/DonationPoolProgress";
import CashfreeDonateButton from "@/components/donate/CashfreeDonateButton";

const STICK_PRICE = 1499;

interface Foundation {
  _id: string;
  foundationName: string;
  code: string;
  foundationSharePercent: number;
  companySharePercent: number;
  displayName?: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  icon?: string;
  primaryColor?: string;
  isActive: boolean;
  priority: number;
  minimumDonation?: number;
}

const presetAmounts = [
  { sticks: 1, amount: 1499, label: "1 Maceazy Pro" },
  { sticks: 2, amount: 2998, label: "2 Maceazy Pro" },
  { sticks: 4, amount: 5996, label: "4 Maceazy Pro" },
  { sticks: 8, amount: 11992, label: "8 Maceazy Pro" },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(1499);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [sticksEquivalent, setSticksEquivalent] = useState<number>(1);
  const [selectedFoundation, setSelectedFoundation] = useState<string>(""); // Holds foundation code (preferred) or ObjectId (fallback)
  const [foundations, setFoundations] = useState<Foundation[]>([]);
  const [loadingFoundations, setLoadingFoundations] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isAnonymous: false,
    // Optional tax exemption fields
    address: "",
    city: "",
    state: "",
    pan: "",
  });
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [messageWordCount, setMessageWordCount] = useState(0);
  const maxWords = 150;

  // Count words in message
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Fetch active foundations
  useEffect(() => {
    const fetchFoundations = async () => {
      try {
        setLoadingFoundations(true);
        const response = await fetch("/api/foundations/active");
        if (!response.ok) throw new Error("Failed to fetch foundations");
        const data = await response.json();
        setFoundations(data.foundations || []);

        // Auto-select first foundation (prefer code over _id)
        if (data.foundations && data.foundations.length > 0) {
          setSelectedFoundation(
            data.foundations[0].code || data.foundations[0]._id
          );
        }
      } catch (error) {
        console.error("Error fetching foundations:", error);
      } finally {
        setLoadingFoundations(false);
      }
    };

    fetchFoundations();
  }, []);

  // Calculate sticks equivalent when amount changes
  useEffect(() => {
    const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;
    setSticksEquivalent(amount / STICK_PRICE);
  }, [selectedAmount, customAmount, isCustom]);

  const handlePresetClick = (amount: number) => {
    setIsCustom(false);
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setIsCustom(true);
      const numValue = parseFloat(value) || 0;
      setSelectedAmount(numValue);
    }
  };

  const getImpactMessage = () => {
    if (sticksEquivalent < 0.5) {
      return "You are contributing towards Maceazy Pro for blind people";
    } else if (sticksEquivalent < 1) {
      return "You are donating 0.5 Maceazy Pro to blind people";
    } else if (sticksEquivalent < 1.5) {
      return "You are donating 1 Maceazy Pro to a blind person";
    } else {
      return `You are donating ${sticksEquivalent.toFixed(1)} Maceazy Pro to blind people`;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    } else if (!/^[6-9]/.test(formData.phone)) {
      newErrors.phone = "Phone number must start with 6, 7, 8, or 9";
    }

    // Optional PAN validation (if provided)
    if (formData.pan && formData.pan.trim() !== "") {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
        newErrors.pan = "Please enter a valid PAN number (e.g., ABCDE1234F)";
      }
    }

    const amount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;
    if (amount < 1) {
      newErrors.amount = "Please enter a valid donation amount";
    }

    // Validate message word count
    if (formData.message && messageWordCount > maxWords) {
      newErrors.message = `Message must not exceed ${maxWords} words (current: ${messageWordCount} words)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Form is valid, payment will be handled by DonateButton
    setPaymentError("");
    setProcessing(true);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setProcessing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/30 via-background to-primary/5 relative">
      {processing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-[90%] text-center border border-border">
            <div
              className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processing your donation
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait, we are verifying your payment and updating the
              leaderboard. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Make a Difference Today
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Help Blind People See the World
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your donation provides Maceazy Pro smart canes that empower
              visually impaired individuals with independence, safety, and
              confidence.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-card border border-border rounded-lg p-6">
                <Users className="w-8 h-8 text-primary mb-3 mx-auto" />
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">
                  People Helped
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <Heart className="w-8 h-8 text-primary mb-3 mx-auto" />
                <div className="text-3xl font-bold text-foreground">₹7.5L+</div>
                <div className="text-sm text-muted-foreground">
                  Donations Raised
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <Award className="w-8 h-8 text-primary mb-3 mx-auto" />
                <div className="text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground">Transparent</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donation Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Donation Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Choose Your Donation
                </h2>

                {/* Preset Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset.amount}
                      onClick={() => handlePresetClick(preset.amount)}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                        !isCustom && selectedAmount === preset.amount
                          ? "border-primary bg-primary/10 shadow-lg scale-105"
                          : "border-border hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <div className="text-2xl font-bold text-foreground mb-2">
                        ₹{preset.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Or enter custom amount
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-destructive text-sm mt-2">
                      {errors.amount}
                    </p>
                  )}
                </div>

                {/* Impact Display */}
                {selectedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">
                          Your Impact
                        </h3>
                        <p className="text-foreground">{getImpactMessage()}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Every Maceazy Pro smart cane transforms a life with
                          safer, more independent mobility.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Payment Error Display */}
                {paymentError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">
                        Payment Error
                      </h4>
                      <p className="text-sm text-destructive/90">
                        {paymentError}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Donor Details Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    Your Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.name ? "border-destructive" : "border-border"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                      placeholder="Enter your name"
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-2">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.email ? "border-destructive" : "border-border"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-2">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number *
                      <span className="text-xs text-muted-foreground ml-2">
                        (10 digits only)
                      </span>
                    </label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      value={formData.phone}
                      onChange={(e) => {
                        // Only allow numbers, max 10 digits
                        const cleaned = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setFormData({ ...formData, phone: cleaned });
                      }}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.phone ? "border-destructive" : "border-border"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground`}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-destructive text-sm mt-2">
                        {errors.phone}
                      </p>
                    )}
                    {formData.phone.length === 10 &&
                      !errors.phone &&
                      /^[6-9]/.test(formData.phone) && (
                        <p className="text-green-600 text-sm mt-2">
                          ✓ Valid phone number
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message (Optional)
                      <span
                        className={`text-xs ml-2 ${
                          messageWordCount > maxWords
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        ({messageWordCount}/{maxWords} words)
                      </span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => {
                        const newMessage = e.target.value;
                        setFormData({ ...formData, message: newMessage });
                        setMessageWordCount(countWords(newMessage));
                      }}
                      rows={4}
                      className={`w-full px-4 py-3 bg-background border ${
                        errors.message ? "border-destructive" : "border-border"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none`}
                      placeholder="Share why you're supporting this cause..."
                    />
                    {errors.message && (
                      <p className="text-destructive text-sm mt-2">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Tax Exemption Section */}
                  <div className="border-t border-border pt-6">
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      Tax Exemption Details (Optional)
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Provide these details to receive 80G tax exemption
                      certificate
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          placeholder="Enter your address"
                          maxLength={200}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          placeholder="Enter city"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          placeholder="Enter state"
                          maxLength={100}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          PAN Number (for 80G certificate)
                        </label>
                        <input
                          type="text"
                          value={formData.pan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pan: e.target.value.toUpperCase(),
                            })
                          }
                          className={`w-full px-4 py-3 bg-background border ${
                            errors.pan ? "border-destructive" : "border-border"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground uppercase`}
                          placeholder="ABCDE1234F"
                          maxLength={10}
                        />
                        {errors.pan && (
                          <p className="text-destructive text-sm mt-2">
                            {errors.pan}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Format: 5 letters, 4 digits, 1 letter (e.g.,
                          ABCDE1234F)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={formData.isAnonymous}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAnonymous: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                    />
                    <label
                      htmlFor="anonymous"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      Make my donation anonymous (your name won&apos;t appear on
                      the leaderboard)
                    </label>
                  </div>

                  {/* Policy Acceptance Checkbox */}
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="policyAcceptance"
                      checked={policyAccepted}
                      onChange={(e) => setPolicyAccepted(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-primary bg-background border-border rounded focus:ring-ring"
                    />
                    <label
                      htmlFor="policyAcceptance"
                      className="ml-2 text-sm text-muted-foreground"
                    >
                      I agree to the{" "}
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </a>{" "}
                      and{" "}
                      <a
                        href="/terms-of-use"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Terms & Refund Policy
                      </a>{" "}
                      *
                    </label>
                  </div>

                  {/* Foundation Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Select Foundation
                    </h3>
                    {loadingFoundations ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : foundations.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-800">
                          No active foundations available. Please try again
                          later.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {foundations.map((foundation) => {
                          const displayName =
                            foundation.displayName || foundation.foundationName;
                          const isSelected =
                            selectedFoundation === foundation.code ||
                            selectedFoundation === foundation._id;

                          return (
                            <button
                              key={foundation._id}
                              type="button"
                              onClick={() =>
                                setSelectedFoundation(
                                  foundation.code || foundation._id
                                )
                              }
                              className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                                isSelected
                                  ? `ring-2 ring-offset-2`
                                  : "border-border bg-card"
                              }`}
                              style={{
                                borderColor: isSelected
                                  ? foundation.primaryColor
                                  : undefined,
                                backgroundColor: isSelected
                                  ? `${foundation.primaryColor}10`
                                  : undefined,
                                ...(isSelected && foundation.primaryColor
                                  ? ({
                                      "--tw-ring-color":
                                        foundation.primaryColor,
                                    } as any)
                                  : {}),
                              }}
                            >
                              <div className="flex items-start gap-3 mb-2">
                                {foundation.logoUrl ? (
                                  <Image
                                    src={foundation.logoUrl}
                                    alt={foundation.foundationName}
                                    width={40}
                                    height={40}
                                    className="object-contain rounded"
                                  />
                                ) : (
                                  <span className="text-3xl">
                                    {foundation.icon || "❤️"}
                                  </span>
                                )}
                                <div className="flex-1">
                                  <div className="font-semibold text-foreground">
                                    {displayName}
                                  </div>
                                  {foundation.tagline && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {foundation.tagline}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div
                                  className="flex items-center gap-1 text-xs font-medium mt-2"
                                  style={{ color: foundation.primaryColor }}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  Selected
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <CashfreeDonateButton
                    amount={selectedAmount}
                    sticksEquivalent={sticksEquivalent}
                    donorDetails={{
                      name: formData.name,
                      email: formData.email,
                      phone: formData.phone,
                      message: formData.message,
                      isAnonymous: formData.isAnonymous,
                      // Optional tax exemption fields
                      address: formData.address,
                      city: formData.city,
                      state: formData.state,
                      pan: formData.pan,
                    }}
                    disabled={
                      !formData.name ||
                      !formData.email ||
                      !formData.phone ||
                      selectedAmount < 1 ||
                      !policyAccepted
                    }
                    onError={handlePaymentError}
                    selectedFoundation={selectedFoundation}
                  />
                </form>
              </motion.div>
            </div>

            {/* Sidebar with Pool Progress & Leaderboard */}
            <div className="lg:col-span-1 space-y-6">
              <DonationPoolProgress />
              <Leaderboard />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Why Maceazy Pro?
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Maceazy Pro is a revolutionary smart cane that uses advanced
              sensors and AI to detect obstacles, providing real-time feedback
              to visually impaired users.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Advanced Obstacle Detection
                </h3>
                <p className="text-muted-foreground">
                  Multi-level sensors detect obstacles from head to toe,
                  ensuring complete safety.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Long Battery Life
                </h3>
                <p className="text-muted-foreground">
                  Up to 8 hours of continuous use with quick charging
                  capability.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Lightweight Design
                </h3>
                <p className="text-muted-foreground">
                  Ergonomically designed for all-day comfort without causing
                  fatigue.
                </p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-left">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Affordable
                </h3>
                <p className="text-muted-foreground">
                  At just ₹1,499, we&apos;re making assistive technology
                  accessible to all.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
