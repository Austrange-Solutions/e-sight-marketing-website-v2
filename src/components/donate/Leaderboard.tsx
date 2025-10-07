"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

interface Donor {
  _id: string;
  donorName: string;
  amount: number;
  sticksEquivalent: number;
  createdAt: string;
}

export default function Leaderboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/donate/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setDonors(data.donors || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-4"
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Top Donors</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-accent rounded-lg">
              <div className="w-6 h-6 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Be the first to donate!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {donors.map((donor, index) => (
            <motion.div
              key={donor._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                index < 3
                  ? "bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
                  : "bg-accent hover:bg-accent/80"
              }`}
            >
              <div className="flex-shrink-0">{getRankIcon(index)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{donor.donorName}</p>
                <p className="text-sm text-muted-foreground">
                  {donor.sticksEquivalent.toFixed(1)} E-Kaathi Pro
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">₹{donor.amount.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(donor.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Updated in real-time
        </p>
      </div>
    </motion.div>
  );
}
