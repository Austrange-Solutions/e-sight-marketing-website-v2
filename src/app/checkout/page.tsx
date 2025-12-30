"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CashfreeButton from "@/components/CashfreeButton";

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [codLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [cartData, setCartData] = useState<{
    items: Array<{
      _id: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }>;
    orderSummary: {
      subtotal: number;
      gst: number;
      transactionFee: number;
      deliveryCharges: number;
      total: number;
    };
  } | null>(null);
  const [calculatedCharges, setCalculatedCharges] = useState<{
    subtotal: number;
    gst: number;
    transactionFee: number;
    deliveryCharges: number;
    total: number;
  } | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isFormValid, setIsFormValid] = useState(false);
  const router = useRouter();

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    addressType: "Home",
  });

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "Name can only contain letters and spaces";
        return "";

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{10}$/.test(value.trim()))
          return "Phone number must be exactly 10 digits";
        if (!/^[6-9]\d{9}$/.test(value.trim()))
          return "Phone number must start with 6, 7, 8, or 9";
        return "";

      case "email":
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim()))
          return "Please enter a valid email address";
        return "";

      case "address":
        if (!value.trim()) return "Street address is required";
        if (value.trim().length < 5)
          return "Address must be at least 5 characters";
        return "";

      case "addressLine2":
        if (!value.trim()) return "Address line 2 is required";
        if (value.trim().length < 2)
          return "Address line 2 must be at least 2 characters";
        return "";

      case "city":
        if (!value.trim()) return "City is required";
        if (value.trim().length < 2)
          return "City must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "City can only contain letters and spaces";
        return "";

      case "state":
        if (!value.trim()) return "State is required";
        if (value.trim().length < 2)
          return "State must be at least 2 characters";
        if (!/^[a-zA-Z\s]+$/.test(value.trim()))
          return "State can only contain letters and spaces";
        return "";

      case "pincode":
        if (!value.trim()) return "Pincode is required";
        if (!/^\d{6}$/.test(value.trim()))
          return "Pincode must be exactly 6 digits";
        return "";

      default:
        return "";
    }
  };

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const requiredFields = [
      "name",
      "phone",
      "email",
      "address",
      "addressLine2",
      "city",
      "state",
      "pincode",
    ];

    requiredFields.forEach((field) => {
      const error = validateField(
        field,
        shippingForm[field as keyof typeof shippingForm]
      );
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  }, [shippingForm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle specific field formatting
    let formattedValue = value;

    if (name === "phone") {
      // Only allow digits and limit to 10 characters
      formattedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pincode") {
      // Only allow digits and limit to 6 characters
      formattedValue = value.replace(/\D/g, "").slice(0, 6);
    } else if (name === "name" || name === "city" || name === "state") {
      // Only allow letters and spaces
      formattedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setShippingForm({
      ...shippingForm,
      [name]: formattedValue,
    });

    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }

    // Real-time validation for the current field
    const error = validateField(name, formattedValue);
    if (error) {
      setValidationErrors({
        ...validationErrors,
        [name]: error,
      });
    }
  };

  const handleContinueToPayment = async () => {
    // Validate the entire form
    if (!validateForm()) {
      alert("Please fix all validation errors before continuing");
      return;
    }

    if (!policyAccepted) {
      alert("Please agree to the Terms & Refund Policy before continuing");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shippingForm,
          paymentMethod: "cashfree",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
        setCheckoutId(data.checkoutId);
        sessionStorage.setItem("checkoutId", data.checkoutId);
        setCartData(data); // Update cartData with POST response so items show in summary
      } else {
        alert(data.error || "Error creating checkout");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating checkout");
    } finally {
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    try {
      console.log("🛒 [CHECKOUT_PAGE] Fetching cart data...");
      const res = await fetch("/api/checkout", {
        credentials: "include", // Ensure cookies are sent
      });

      if (!res.ok) {
        console.error(
          "❌ [CHECKOUT_PAGE] Failed to fetch cart:",
          res.status,
          res.statusText
        );
        const errorData = await res.json();
        console.error("Error details:", errorData);
        return;
      }

      const data = await res.json();
      console.log("✅ [CHECKOUT_PAGE] Cart data received:", {
        itemCount: data.items?.length || 0,
        hasOrderSummary: !!data.orderSummary,
        subtotal: data.orderSummary?.subtotal,
      });

      setCartData(data);
    } catch (error) {
      console.error("❌ [CHECKOUT_PAGE] Error fetching cart data:", error);
    }
  };

  const calculateDynamicCharges = useCallback(async () => {
    if (!cartData || !cartData.orderSummary) return;

    const subtotal = cartData.orderSummary.subtotal;
    const gst = subtotal * 0.18; // 18% GST
    const transactionFee = subtotal * 0.02; // 2% transaction fee

    let deliveryCharges = 500; // Default charges for non-delivery zones

    // Enhanced pincode validation with strict digit-by-digit matching
    if (shippingForm.pincode && shippingForm.pincode.trim().length >= 6) {
      try {
        const response = await fetch("/api/validate-pincode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pincode: shippingForm.pincode.trim(),
            orderAmount: subtotal,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            deliveryCharges = result.data.deliveryCharges;

            // Alert user if pincode validation failed
            if (
              !result.data.isValid &&
              result.data.validationErrors.length > 0
            ) {
              // You can show user notification here if needed
            }
          } else {
            deliveryCharges = 500; // Default for failed validation
          }
        } else {
          deliveryCharges = 500; // Default charges
        }
      } catch (error) {
        console.error("Error in pincode validation:", error);
        // Final fallback - use city-based logic only if everything fails
        const isMumbai =
          shippingForm.city.toLowerCase().includes("mumbai") ||
          shippingForm.city.toLowerCase().includes("bombay");
        deliveryCharges = isMumbai ? 100 : 500;
      }
    } else if (shippingForm.pincode && shippingForm.pincode.trim().length > 0) {
      // Invalid pincode length - apply default charges
      deliveryCharges = 500;
    }

    const total = subtotal + gst + transactionFee + deliveryCharges;

    setCalculatedCharges({
      subtotal,
      gst,
      transactionFee,
      deliveryCharges,
      total,
    });
  }, [cartData, shippingForm.pincode, shippingForm.city]);

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Recalculate charges when pincode or city changes
  useEffect(() => {
    if (cartData && (shippingForm.pincode || shippingForm.city)) {
      calculateDynamicCharges();
    }
  }, [
    shippingForm.pincode,
    shippingForm.city,
    cartData,
    calculateDynamicCharges,
  ]);

  // Validate form whenever form data changes
  useEffect(() => {
    validateForm();
  }, [shippingForm, validateForm]);

  const calculateTotal = () => {
    if (!calculatedCharges && !cartData) return 0;

    const charges = calculatedCharges || cartData?.orderSummary;
    if (!charges) return 0;
    return (
      charges.subtotal +
      charges.gst +
      charges.transactionFee +
      charges.deliveryCharges
    );
  };

  const getCurrentCharges = () => {
    return calculatedCharges || cartData?.orderSummary;
  };

  if (!cartData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  const charges = getCurrentCharges();

  return (
    <div className="min-h-screen bg-accent mt-16 py-8 relative">
      {paymentProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-[90%] text-center border border-border">
            <div
              className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
              aria-hidden="true"
            />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Processing your payment
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait, we are verifying your payment and creating your
              order. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              1
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">Step 1</div>
              <div className="text-xs text-muted-foreground">
                Shipping Address
              </div>
            </div>
          </div>
          <div className="w-20 h-1 bg-muted mx-4"></div>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              2
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">Step 2</div>
              <div className="text-xs text-muted-foreground">
                Payment Method
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border p-8">
              {step === 1 && (
                <>
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-4">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Shipping Information
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Enter your delivery address details
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={shippingForm.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.name
                              ? "border-destructive focus:ring-destructive focus:border-destructive"
                              : "border-border"
                          }`}
                          placeholder="Enter your full name"
                        />
                        {validationErrors.name && (
                          <p className="mt-1 text-sm text-destructive">
                            {validationErrors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone Number{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[6-9][0-9]{9}"
                          name="phone"
                          value={shippingForm.phone}
                          onChange={handleInputChange}
                          maxLength={10}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.phone
                              ? "border-destructive focus:ring-destructive focus:border-destructive"
                              : "border-border"
                          }`}
                          placeholder="Enter 10-digit phone number"
                        />
                        {validationErrors.phone && (
                          <p className="mt-1 text-sm text-destructive">
                            {validationErrors.phone}
                          </p>
                        )}
                        {shippingForm.phone &&
                          !validationErrors.phone &&
                          shippingForm.phone.length === 10 && (
                            <p className="mt-1 text-sm text-green-600">
                              ✓ Valid phone number
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        name="email"
                        value={shippingForm.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          validationErrors.email
                            ? "border-destructive focus:ring-destructive focus:border-destructive"
                            : "border-border"
                        }`}
                        placeholder="Enter your email address"
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-destructive">
                          {validationErrors.email}
                        </p>
                      )}
                      {shippingForm.email &&
                        !validationErrors.email &&
                        shippingForm.email.includes("@") && (
                          <p className="mt-1 text-sm text-green-600">
                            ✓ Valid email address
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Shipping Address
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Street Address{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={shippingForm.address}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.address
                              ? "border-destructive focus:ring-destructive focus:border-destructive"
                              : "border-border"
                          }`}
                          placeholder="House no., Building name, Street"
                        />
                        {validationErrors.address && (
                          <p className="mt-1 text-sm text-destructive">
                            {validationErrors.address}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Address Line 2{" "}
                          <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={shippingForm.addressLine2}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.addressLine2
                              ? "border-destructive focus:ring-destructive focus:border-destructive"
                              : "border-border"
                          }`}
                          placeholder="Apartment, suite, floor"
                        />
                        {validationErrors.addressLine2 && (
                          <p className="mt-1 text-sm text-destructive">
                            {validationErrors.addressLine2}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Landmark
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={shippingForm.landmark}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Near landmark (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            City <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={shippingForm.city}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              validationErrors.city
                                ? "border-destructive focus:ring-destructive focus:border-destructive"
                                : "border-border"
                            }`}
                            placeholder="Enter city"
                          />
                          {validationErrors.city && (
                            <p className="mt-1 text-sm text-destructive">
                              {validationErrors.city}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            State <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={shippingForm.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              validationErrors.state
                                ? "border-destructive focus:ring-destructive focus:border-destructive"
                                : "border-border"
                            }`}
                            placeholder="Enter state"
                          />
                          {validationErrors.state && (
                            <p className="mt-1 text-sm text-destructive">
                              {validationErrors.state}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Pincode <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={shippingForm.pincode}
                            onChange={handleInputChange}
                            maxLength={6}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              validationErrors.pincode
                                ? "border-destructive focus:ring-destructive focus:border-destructive"
                                : "border-border"
                            }`}
                            placeholder="Enter 6-digit pincode"
                          />
                          {validationErrors.pincode && (
                            <p className="mt-1 text-sm text-destructive">
                              {validationErrors.pincode}
                            </p>
                          )}
                          {shippingForm.pincode &&
                            !validationErrors.pincode &&
                            shippingForm.pincode.length === 6 && (
                              <p className="mt-1 text-sm text-green-600">
                                ✓ Valid pincode format
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Country
                          </label>
                          <select
                            name="country"
                            value={shippingForm.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="India">India</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Address Type
                          </label>
                          <select
                            name="addressType"
                            value={shippingForm.addressType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-start gap-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={setAsDefault}
                            onChange={(e) => setSetAsDefault(e.target.checked)}
                            className="rounded border-border text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-foreground">
                            Set as default address
                          </span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={policyAccepted}
                            onChange={(e) =>
                              setPolicyAccepted(e.target.checked)
                            }
                            className="rounded border-border text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-foreground">
                            I agree to the{" "}
                            <a href="/terms-of-use" className="underline">
                              Terms & Refund Policy
                            </a>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    disabled={
                      loading ||
                      !isFormValid ||
                      Object.keys(validationErrors).some(
                        (key) => validationErrors[key]
                      ) ||
                      !policyAccepted
                    }
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition duration-200 ${
                      loading ||
                      !isFormValid ||
                      Object.keys(validationErrors).some(
                        (key) => validationErrors[key]
                      ) ||
                      !policyAccepted
                        ? "bg-gray-400 text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-blue-700"
                    }`}
                  >
                    {loading ? "Processing..." : "Continue to Payment"}
                  </button>

                  {/* Validation Summary */}
                  {Object.keys(validationErrors).some(
                    (key) => validationErrors[key]
                  ) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <svg
                          className="w-5 h-5 text-destructive mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <h4 className="text-sm font-medium text-red-800">
                          Please fix the following errors:
                        </h4>
                      </div>
                      <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                        {Object.entries(validationErrors).map(
                          ([field, error]) =>
                            error && <li key={field}>{error}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {isFormValid &&
                    !Object.keys(validationErrors).some(
                      (key) => validationErrors[key]
                    ) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 text-green-600 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-green-800">
                            All fields are valid. Ready to proceed!
                          </span>
                        </div>
                      </div>
                    )}
                </>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white mr-4">
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        Payment
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        Complete your order securely
                      </p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-accent rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Choose Payment Method
                    </h3>

                    {/* Cashfree Payment */}
                    <div className="space-y-4">
                      <div className="bg-card rounded-lg border-2 border-blue-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">
                                Online Payment
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Pay securely
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              ₹{calculateTotal().toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Amount
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            UPI
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Cards
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Net Banking
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            Wallets
                          </span>
                        </div>

                        <CashfreeButton
                          product={{
                            name: `Maceazy Order (${cartData?.items?.length || 0} items)`,
                            price: calculateTotal(),
                          }}
                          userDetails={{
                            name: shippingForm.name,
                            email: shippingForm.email,
                            phone: shippingForm.phone,
                          }}
                          checkoutId={checkoutId}
                          buttonText={
                            paymentProcessing ? "Processing..." : "Pay Now"
                          }
                          disabled={codLoading || paymentProcessing}
                          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition duration-200 ${
                            codLoading || paymentProcessing
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-primary text-primary-foreground hover:bg-blue-700"
                          }`}
                          onStart={() => {
                            // Show overlay immediately when user enters Cashfree checkout
                            setPaymentProcessing(true);
                          }}
                          onSuccess={() => {
                            // Keep processing overlay visible until navigation completes
                            router.push("/success?payment=completed");
                          }}
                          onFailure={() => {
                            alert("Payment failed. Please try again.");
                            setPaymentProcessing(false);
                          }}
                        />
                      </div>

                      {/* Cash on Delivery Option */}
                      {/* <div className="bg-card rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white mr-3">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">Cash on Delivery</h4>
                              <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Prevent multiple clicks
                            if (codLoading || paymentProcessing) return;
                            
                            // Handle COD order placement
                            if (checkoutId) {
                              setCodLoading(true);
                              setPaymentProcessing(true);
                              
                              fetch("/api/orders/create", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  checkoutId,
                                  paymentInfo: {
                                    method: 'cod',
                                    status: 'pending',
                                  },
                                  customerInfo: {
                                    name: shippingForm.name,
                                    email: shippingForm.email,
                                    phone: shippingForm.phone,
                                  },
                                }),
                              })
                              .then(res => res.json())
                              .then(data => {
                                if (data.success) {
                                  router.push("/success?payment=cod");
                                } else {
                                  alert("Failed to place order: " + data.error);
                                  setCodLoading(false);
                                  setPaymentProcessing(false);
                                }
                              })
                              .catch(error => {
                                console.error("COD order error:", error);
                                alert("Failed to place order. Please try again.");
                                setCodLoading(false);
                                setPaymentProcessing(false);
                              });
                            } else {
                              alert("Please complete shipping information first.");
                            }
                          }}
                          disabled={codLoading || paymentProcessing}
                          className={`w-full text-white py-3 px-6 rounded-lg font-medium transition duration-200 ${
                            codLoading || paymentProcessing 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {codLoading ? "Processing..." : "Place Order - COD"}
                        </button>
                      </div> */}
                    </div>
                  </div>

                  {/* Back to Shipping Button */}
                  <button
                    onClick={() => setStep(1)}
                    className="w-full border border-border text-foreground py-3 px-6 rounded-lg font-medium hover:bg-accent transition duration-200"
                  >
                    ← Back to Shipping Information
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-2">
                Order Summary
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {cartData && cartData.items ? cartData.items.length : 0} item(s)
                in your cart
              </p>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartData &&
                  cartData.items &&
                  cartData.items.map(
                    (
                      item: {
                        _id: string;
                        name: string;
                        price: number;
                        quantity: number;
                        image: string;
                      },
                      index: number
                    ) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="relative">
                          <Image
                            src={item.image || "/placeholder-product.jpg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <span className="absolute -top-2 -right-2 bg-accent0 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {item.name}
                          </h4>
                          <p className="text-muted-foreground text-xs mb-1">
                            we can give hope to blind people to atleast walk
                            freely th...
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">
                              ₹{item.price * item.quantity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ₹{item.price} each
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              </div>

              {/* Order Summary Details */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal (
                    {cartData && cartData.items ? cartData.items.length : 0}{" "}
                    items)
                  </span>
                  <span className="font-medium">
                    ₹{charges?.subtotal?.toFixed(2) || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium">
                    ₹{charges?.gst?.toFixed(2) || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Transaction Fee (2%)
                  </span>
                  <span className="font-medium">
                    ₹{charges?.transactionFee?.toFixed(2) || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {charges?.deliveryCharges === 100
                      ? "Delivery Charges (Mumbai Suburban)"
                      : charges?.deliveryCharges === 500
                        ? "Delivery Charges (Outside Mumbai)"
                        : "Delivery Charges"}
                  </span>
                  <span className="font-medium">
                    ₹{charges?.deliveryCharges || 100}
                  </span>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-foreground">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Inclusive of all taxes
                  </p>
                </div>
              </div>

              {/* Pincode-based delivery message */}
              {shippingForm.pincode && shippingForm.pincode.length === 6 && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {charges?.deliveryCharges === 100
                      ? `🏙️ Mumbai Suburban (${shippingForm.pincode}): ₹100 delivery`
                      : `📦 Outside Mumbai (${shippingForm.pincode}): ₹500 delivery`}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Delivery charges calculated based on your pincode
                  </p>
                </div>
              )}

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-green-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    Secure 256-bit SSL encrypted checkout
                  </span>
                </div>
                <div className="flex items-center text-blue-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM10 2a8 8 0 100 16 8 8 0 000-16zm0 11a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    Your personal data is protected
                  </span>
                </div>
                <div className="flex items-center text-purple-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  <span className="text-sm">Fast & reliable delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
