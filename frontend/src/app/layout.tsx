import type { Metadata, Viewport } from "next";
import { Epilogue, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@frontend/lib/auth-context";
import { ToastProvider } from "@frontend/components/toast-provider";
import { ThemeProvider } from "@frontend/components/theme-provider";
import "../styles/globals.css";

const _epilogue = Epilogue({ 
  subsets: ["latin"], 
  variable: "--font-epilogue", 
  display: "swap" 
});

const _manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#6c2bd9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "SONIQ | Premium Social Music Experience",
    template: "%s | SONIQ"
  },
  description: "Experience premium real-time social music streaming with SONIQ. Listen together, vibe together.",
  applicationName: "SONIQ",
  authors: [{ name: "SONIQ Team" }],
  generator: "Next.js",
  keywords: ["music streaming", "social music", "shared rooms", "real-time audio", "SONIQ"],
  referrer: "origin-when-cross-origin",
  creator: "SONIQ Team",
  publisher: "SONIQ",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/assets/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon_io/favicon.ico", rel: "icon" },
    ],
    apple: [
      { url: "/assets/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/assets/favicon_io/android-chrome-192x192.png",
      },
    ],
  },
  manifest: "/assets/favicon_io/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://soniq.music",
    siteName: "SONIQ",
    title: "SONIQ | Premium Social Music Experience",
    description: "Real-time social music streaming. Join rooms, listen together, and discover new vibes.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "SONIQ - Shared Music Rooms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SONIQ | Premium Social Music Experience",
    description: "Real-time social music streaming. Join rooms and listen together.",
    images: ["/assets/og-image.png"],
    creator: "@soniq_music",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={`${_epilogue.variable} ${_manrope.variable} bg-background font-sans antialiased`}
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
