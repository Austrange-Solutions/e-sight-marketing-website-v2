/**
 * FrameBuster Component
 * 
 * Provides JavaScript-based clickjacking protection as a backup to HTTP headers.
 * This is a defense-in-depth measure and should NOT be relied upon as the primary
 * protection mechanism. HTTP headers (X-Frame-Options and CSP frame-ancestors) 
 * are the primary defense.
 * 
 * Usage:
 * Import and add to your root layout (src/app/layout.tsx)
 * 
 * @example
 * import FrameBuster from '@/components/security/FrameBuster';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <FrameBuster />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */

"use client";

import { useEffect } from "react";

export default function FrameBuster() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    try {
      // Check if the page is loaded within an iframe
      if (window.self !== window.top) {
        console.warn(
          "[FrameBuster] Detected iframe embedding. Attempting to break out..."
        );

        // Attempt to redirect the top window to the current location
        // This will fail if the parent frame has a different origin (CORS)
        try {
          window.top!.location.href = window.self.location.href;
        } catch (e) {
          // If we can't redirect (cross-origin), hide the content
          console.error(
            "[FrameBuster] Unable to break out of iframe (cross-origin). Hiding content."
          );
          document.body.style.display = "none";
          
          // Show a warning message
          const warning = document.createElement("div");
          warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          `;
          warning.innerHTML = `
            <div>
              <h1 style="color: #d32f2f; margin-bottom: 20px;">⚠️ Security Warning</h1>
              <p style="color: #333; font-size: 18px; margin-bottom: 15px;">
                This page cannot be displayed within a frame for security reasons.
              </p>
              <p style="color: #666; font-size: 14px;">
                Please visit our website directly at: 
                <a href="${window.location.href}" style="color: #1976d2;">
                  ${window.location.hostname}
                </a>
              </p>
            </div>
          `;
          document.body.appendChild(warning);
        }
      }
    } catch (error) {
      // Catch any unexpected errors
      console.error("[FrameBuster] Error during frame detection:", error);
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}
