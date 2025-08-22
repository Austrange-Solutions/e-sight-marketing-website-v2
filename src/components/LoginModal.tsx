'use client';

import React from 'react';
import { X, LogIn, UserPlus, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginModal({ isOpen, onClose, message = "Please login to continue" }: LoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleSignup = () => {
    onClose();
    const currentPath = window.location.pathname;
    router.push(`/signup?redirect=${encodeURIComponent(currentPath)}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 relative transform transition-all">
        {/* Close Button - Mobile Optimized */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6 pt-2">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Login Required</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 px-2">{message}</p>
        </div>

        {/* Buttons - Mobile Optimized */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Login to Continue
          </button>
          
          <button
            onClick={handleSignup}
            className="w-full flex items-center justify-center px-4 py-3 sm:py-3.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all font-medium text-sm sm:text-base hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Create New Account
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 sm:py-3 text-gray-500 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all text-sm sm:text-base"
          >
            Browse without Login
          </button>
        </div>

        {/* Bottom Note - Mobile Optimized */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            💡 Login to unlock cart, wishlist, and faster checkout
          </p>
        </div>
      </div>
    </div>
  );
}
