import type React from "react";
import type { Metadata } from "next";
import { Inter, Poppins, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@frontend/lib/auth-context";
import { ToastProvider } from "@frontend/components/toast-provider";
import { ThemeProvider } from "@frontend/components/theme-provider";
import "../styles/globals.css";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});
const _outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "SONIQ - Shared Music Rooms",
  description: "Experience premium real-time social music streaming with SONIQ",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${_inter.variable} ${_poppins.variable} ${_outfit.variable} bg-background font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
