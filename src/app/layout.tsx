import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Commented out as they're not being used
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { getServerUser } from "@/lib/server/auth";
import { getServerCart } from "@/lib/server/cart";

export const metadata: Metadata = {
  title: "E-Kaathi, Your Path, Your Freedom",
  description: "Experience independence with e-Kaathi's revolutionary smart blind stick.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch initial server data
  const user = await getServerUser();
  const cart = user ? await getServerCart(user._id) : [];

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers initialCart={cart}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
