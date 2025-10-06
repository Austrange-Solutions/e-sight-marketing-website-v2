"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 6) {
      setMessage("❌ Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("❌ Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/users/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setMessage("✅ Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: unknown) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded shadow">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">New Password</label>
            <input
              id="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <div className="mt-4 text-center">{message}</div>}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-accent"><div>Loading...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
