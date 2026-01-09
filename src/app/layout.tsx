import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Commented out as they're not being used
import "./globals.css";
import Navbar from "@/components/Navbar";
import ProductsNavbar from "@/components/products/ProductsNavbar";
import Footer from "@/components/Footer";
import { SessionProvider } from "next-auth/react"
import Providers from "@/components/Providers";
import { Provider } from "./provider"
import { getServerUser } from "@/lib/server/auth";
import { getServerCart, ServerCartItem } from "@/lib/server/cart";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Maceazy - Making Life easier, For Specially Abled",
  description: "Experience independence with Maceazy's revolutionary smart blind stick.",
  icons: {
    icon: '/favicon.ico', // You can change this to point to your custom icon
    // Or use multiple sizes:
    // icon: [
    //   { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    //   { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    // ],
    // apple: '/apple-touch-icon.png', // For Apple devices
  },
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
            {(async () => {
              const host = (await headers()).get('host') || '';
              const sub = host.split('.')[0];
              const isProducts = sub === 'products' || host.startsWith('products.');
              const Nav = isProducts ? ProductsNavbar : Navbar;
              return <Nav />;
            })()}
            <main className="grow"><Provider>{children}</Provider></main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
