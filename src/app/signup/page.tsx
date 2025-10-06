"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react";
import { useSession } from "next-auth/react";

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    const router = useRouter();
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const authLoading = status === 'loading';
    const [user, setUser] = React.useState({
        email: "",
        password: "",
        username: "",
        phone: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [isValidating, setIsValidating] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push("/profile");
        }
    }, [authLoading, isAuthenticated, router]);

    // Debounced validation function
    const validateField = async (field: string, value: string) => {
        if (!value) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            return;
        }

        try {
            setIsValidating(true);
            const response = await axios.post("/api/users/validate", {
                [field]: value
            });

            if (!response.data.isValid) {
                const error = response.data.errors.find((err: { field: string; message: string }) => err.field === field);
                if (error) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [field]: error.message
                    }));
                }
            } else {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        } catch (error) {
            console.error("Validation error:", error);
        } finally {
            setIsValidating(false);
        }
    };

    // Debounce validation calls
    useEffect(() => {
        const timer = setTimeout(() => {
            if (user.email) validateField('email', user.email);
        }, 500);
        return () => clearTimeout(timer);
    }, [user.email]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user.username) validateField('username', user.username);
        }, 500);
        return () => clearTimeout(timer);
    }, [user.username]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (user.phone) validateField('phone', user.phone);
        }, 500);
        return () => clearTimeout(timer);
    }, [user.phone]);

    const onSignup = async () => {
        try {
            setLoading(true);
            
            // Final validation before signup
            const validationResponse = await axios.post("/api/users/validate", {
                email: user.email,
                username: user.username,
                phone: user.phone || undefined
            });

            if (!validationResponse.data.isValid) {
                const errors = validationResponse.data.errors;
                const errorMessages = errors.map((err: { message: string }) => err.message).join(', ');
                toast.error(`Validation failed: ${errorMessages}`);
                return;
            }

            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            toast.success("Account created successfully!");
            router.push("/verifyemail");
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Signup failed';
            console.log("Signup failed", errorMessage);
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error || "Signup failed");
            } else {
                toast.error("Signup failed");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const hasValidationErrors = Object.keys(validationErrors).length > 0;
        const hasRequiredFields = user.email.length > 0 && user.password.length > 0 && user.username.length > 0;
        setButtonDisabled(!hasRequiredFields || hasValidationErrors || isValidating);
    }, [user, validationErrors, isValidating]);

    return (
        <div className="min-h-screen bg-accent flex items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6 sm:space-y-8">
                {/* Header */}
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-foreground">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        Join us and start your journey
                    </p>
                </div>

                {/* Form */}
                <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={(e) => { e.preventDefault(); onSignup(); }}>
                    <div className="space-y-3 sm:space-y-4">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 sm:py-2 pl-10 border placeholder-gray-500 text-foreground rounded-md focus:outline-none focus:ring-ring focus:border-indigo-500 focus:z-10 text-base sm:text-sm ${
                                        validationErrors.username ? 'border-red-300' : 'border-border'
                                    }`}
                                    placeholder="Enter your username"
                                    value={user.username}
                                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                                />
                            </div>
                            {validationErrors.username && (
                                <p className="mt-1 text-sm text-destructive">{validationErrors.username}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={`appearance-none relative block w-full px-3 py-3 sm:py-2 pl-10 border placeholder-gray-500 text-foreground rounded-md focus:outline-none focus:ring-ring focus:border-indigo-500 focus:z-10 text-base sm:text-sm ${
                                        validationErrors.email ? 'border-red-300' : 'border-border'
                                    }`}
                                    placeholder="Enter your email"
                                    value={user.email}
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                />
                            </div>
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-destructive">{validationErrors.email}</p>
                            )}
                        </div>


                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-border placeholder-gray-500 text-foreground rounded-md focus:outline-none focus:ring-ring focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Create a strong password"
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center">
                        <input
                            id="agree-terms"
                            name="agree-terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-primary focus:ring-ring border-border rounded"
                        />
                        <label htmlFor="agree-terms" className="ml-2 block text-sm text-foreground">
                            I agree to the{' '}
                            <Link href="/terms" className="text-primary hover:text-primary/90">
                                Terms and Conditions
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary hover:text-primary/90">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <div>
                        {isValidating && (
                            <p className="mb-2 text-sm text-yellow-600 text-center">
                                Validating information...
                            </p>
                        )}
                        {Object.keys(validationErrors).length > 0 && (
                            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-destructive text-center">
                                    Please fix the validation errors above
                                </p>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={buttonDisabled || loading}
                            className="group relative w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent text-base sm:text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 touch-manipulation"
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-accent text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:text-primary/90 transition-colors duration-200"
                        >
                            Sign in to your account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
