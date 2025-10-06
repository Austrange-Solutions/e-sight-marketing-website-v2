"use client";
import { useState } from "react";

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/users/forgotpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reset link");
      setMessage("✅ Password reset link sent to your email.");
    } catch (error: unknown) {
      setMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded shadow">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Email Address</label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-border rounded"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your registered email"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full py-2 px-4 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && <div className="mt-4 text-center">{message}</div>}
      </div>
    </div>
  );
}
