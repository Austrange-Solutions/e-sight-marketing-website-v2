import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Commented out as they're not being used
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react"
import Providers from "@/components/Providers";
import { Provider } from "./provider"
import { getServerUser } from "@/lib/server/auth";
import { getServerCart, ServerCartItem } from "@/lib/server/cart";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "E-sight, Your Path, Your Freedom",
  description: "Experience independence with e-Sight's revolutionary smart blind stick.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial server data with error handling
  let user = null;
  let cart: ServerCartItem[] = [];
  
  try {
    user = await getServerUser();
    if (user) {
      cart = await getServerCart(user._id);
    }
  } catch (error) {
    console.error('Error fetching server data:', error);
    // Don't crash the app, just proceed with empty data
  }

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers initialCart={cart}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow"><Provider>{children}</Provider></main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
