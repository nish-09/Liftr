import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "@/styles/globals.css";
import StorageSanitizer from "@/components/common/StorageSanitizer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Liftr — Progressive Overload & Athletic Performance",
  description:
    "Pastel Neo-Brutalist athletic performance platform connecting workout tracking, progressive overload, and body composition.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Liftr",
  },
};

export const viewport: Viewport = {
  themeColor: "#EBCBF7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-[#EBCBF7] text-[#142746] antialiased selection:bg-[#E9FF91] selection:text-[#142746]">
        <StorageSanitizer />
        {children}
      </body>
    </html>
  );
}
