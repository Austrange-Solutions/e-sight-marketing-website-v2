"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RazorpayButton from "@/components/RazorpayButton";

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [calculatedCharges, setCalculatedCharges] = useState<any>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string>("");
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

  // Fetch cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);

  // Recalculate charges when city changes
  useEffect(() => {
    if (cartData && shippingForm.city) {
      calculateDynamicCharges();
    }
  }, [shippingForm.city, cartData]);

  const fetchCartData = async () => {
    try {
      const res = await fetch("/api/checkout");
      const data = await res.json();
      setCartData(data);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  const calculateDynamicCharges = () => {
    if (!cartData) return;

    const subtotal = cartData.orderSummary.subtotal;
    const gst = subtotal * 0.18; // 18% GST
    const transactionFee = subtotal * 0.02; // 2% transaction fee
    
    // Check if city is Mumbai
    const isMumbai = shippingForm.city.toLowerCase().includes('mumbai') || 
                     shippingForm.city.toLowerCase().includes('bombay');
    const deliveryCharges = isMumbai ? 500 : 1000;

    setCalculatedCharges({
      subtotal,
      gst,
      transactionFee,
      deliveryCharges,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinueToPayment = async () => {
    if (!shippingForm.name || !shippingForm.phone || !shippingForm.email || 
        !shippingForm.address || !shippingForm.city || !shippingForm.state || 
        !shippingForm.pincode) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shippingForm,
          paymentMethod: "razorpay",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
        setCheckoutId(data.checkoutId);
        sessionStorage.setItem("checkoutId", data.checkoutId);
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

  const calculateTotal = () => {
    if (!calculatedCharges && !cartData) return 0;
    
    const charges = calculatedCharges || cartData.orderSummary;
    return charges.subtotal + charges.gst + charges.transactionFee + charges.deliveryCharges;
  };

  const getCurrentCharges = () => {
    return calculatedCharges || cartData?.orderSummary;
  };

  if (!cartData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const charges = getCurrentCharges();

  return (
    <div className="min-h-screen bg-gray-50 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">Step 1</div>
              <div className="text-xs text-gray-600">Shipping Address</div>
            </div>
          </div>
          <div className="w-20 h-1 bg-gray-300 mx-4"></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <div className="ml-2">
              <div className="text-sm font-medium">Step 2</div>
              <div className="text-xs text-gray-600">Payment Method</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {step === 1 && (
                <>
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white mr-4">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
                      <p className="text-gray-500 mt-1">Enter your delivery address details</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={shippingForm.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shippingForm.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={shippingForm.address}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="House no., Building name, Street"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={shippingForm.addressLine2}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Apartment, suite, floor"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Landmark
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={shippingForm.landmark}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Near landmark (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={shippingForm.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter city"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={shippingForm.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter state"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={shippingForm.pincode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter pincode"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <select
                            name="country"
                            value={shippingForm.country}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="India">India</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address Type
                          </label>
                          <select
                            name="addressType"
                            value={shippingForm.addressType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={setAsDefault}
                          onChange={(e) => setSetAsDefault(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToPayment}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                  >
                    {loading ? "Processing..." : "Continue to Payment"}
                  </button>
                </>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center mb-8">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white mr-4">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                      <p className="text-gray-500 mt-1">Complete your order securely</p>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
                    
                    {/* Razorpay Payment */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white mr-3">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Online Payment</h4>
                              <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">₹{calculateTotal().toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Total Amount</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">UPI</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Cards</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Net Banking</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Wallets</span>
                        </div>

                        <RazorpayButton
                          product={{
                            name: `E-Sight Order (${cartData?.items?.length || 0} items)`,
                            price: calculateTotal()
                          }}
                          userDetails={{
                            name: shippingForm.name,
                            email: shippingForm.email,
                            phone: shippingForm.phone
                          }}
                          checkoutId={checkoutId}
                          buttonText="Pay Now"
                          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-200"
                          onSuccess={(paymentResponse) => {
                            console.log("Payment successful:", paymentResponse);
                            // Redirect to success page with order details
                            router.push("/success?payment=completed");
                          }}
                          onFailure={(error) => {
                            console.error("Payment failed:", error);
                            alert("Payment failed. Please try again.");
                          }}
                        />
                      </div>

                      {/* Cash on Delivery Option */}
                      <div className="bg-white rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white mr-3">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">Cash on Delivery</h4>
                              <p className="text-sm text-gray-500">Pay when you receive your order</p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Handle COD order placement
                            if (checkoutId) {
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
                                }
                              })
                              .catch(error => {
                                console.error("COD order error:", error);
                                alert("Failed to place order. Please try again.");
                              });
                            } else {
                              alert("Please complete shipping information first.");
                            }
                          }}
                          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition duration-200"
                        >
                          Place Order - COD
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Back to Shipping Button */}
                  <button
                    onClick={() => setStep(1)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition duration-200"
                  >
                    ← Back to Shipping Information
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Order Summary</h2>
              <p className="text-gray-500 text-sm mb-6">{cartData.items.length} item(s) in your cart</p>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartData.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={item.image || "/placeholder-product.jpg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                      <p className="text-gray-500 text-xs mb-1">we can give hope to blind people to atleast walk freely th...</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold">₹{item.price * item.quantity}</span>
                        <span className="text-xs text-gray-500">₹{item.price} each</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Details */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartData.items.length} items)</span>
                  <span className="font-medium">₹{charges?.subtotal?.toFixed(2) || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{charges?.gst?.toFixed(2) || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Fee (2%)</span>
                  <span className="font-medium">₹{charges?.transactionFee?.toFixed(2) || 0}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {shippingForm.city && !shippingForm.city.toLowerCase().includes('mumbai') 
                      ? "Delivery Charges (Outside Mumbai)" 
                      : "Delivery Charges"}
                  </span>
                  <span className="font-medium">₹{charges?.deliveryCharges || 500}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-blue-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>
              </div>

              {/* Location-based message */}
              {shippingForm.city && (
                <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    {shippingForm.city.toLowerCase().includes('mumbai') 
                      ? "🏙️ Mumbai delivery: ₹500" 
                      : "📦 Outside Mumbai delivery: ₹1000"}
                  </p>
                </div>
              )}

              {/* Security Features */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Secure 256-bit SSL encrypted checkout</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-0.257-0.257A6 6 0 1118 8zM10 2a8 8 0 100 16 8 8 0 000-16zm0 11a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Your personal data is protected</span>
                </div>
                <div className="flex items-center text-purple-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
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