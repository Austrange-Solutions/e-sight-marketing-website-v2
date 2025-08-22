"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        general: ""
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            // Get redirect URL from query params or default to profile
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || '/profile';
            router.push(redirectUrl);
        }
    }, [authLoading, isAuthenticated, router]);

    // Validation function
    const validateForm = () => {
        const newErrors = { email: "", password: "", general: "" };
        let isValid = true;

        // Email validation
        if (!user.email) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Password validation
        if (!user.password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (user.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const onLogin = async () => {
        // Clear previous errors
        setErrors({ email: "", password: "", general: "" });
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const result = await login(user.email, user.password);
            
            if (result.success) {
                // Store remember me preference
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('userEmail', user.email);
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('userEmail');
                }
                
                toast.success(result.message);
                // Get redirect URL from query params or default to profile
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect') || '/profile';
                router.push(redirectUrl);
            } else {
                setErrors({ ...errors, general: result.message });
                toast.error(result.message);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            console.log("Login failed", errorMessage);
            setErrors({ ...errors, general: errorMessage });
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Load remembered email on component mount
    useEffect(() => {
        const remembered = localStorage.getItem('rememberMe');
        const savedEmail = localStorage.getItem('userEmail');
        
        if (remembered === 'true' && savedEmail) {
            setUser(prev => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        const hasValidEmail = user.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
        const hasValidPassword = user.password.length >= 6;
        setButtonDisabled(!hasValidEmail || !hasValidPassword);
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 sm:space-y-8">
                {/* Header */}
                <div>
                    {/* <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                        <LogIn className="h-8 w-8 text-indigo-600" />
                    </div> */}
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Welcome back! Please enter your details
                    </p>
                </div>

                {/* Form */}
                <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <div className="space-y-3 sm:space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-3 py-3 sm:py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base sm:text-sm"
                                    placeholder="Enter your email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter your password"
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Remember me and Forgot password */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link
                                href="/forgotpassword"
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={buttonDisabled || loading}
                            className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gray-100 text-gray-500">
                                    Don&apos;t have an account?
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Signup Link */}
                    <div className="text-center">
                        <Link
                            href="/signup"
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                        >
                            Create a new account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}