import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import StorageSanitizer from "@/components/common/StorageSanitizer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Liftr — Progressive Overload & Athletic Performance",
  description:
    "Neo-Brutalist athletic performance platform connecting workout tracking, progressive overload, and body composition.",
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
    statusBarStyle: "black-translucent",
    title: "Liftr",
  },
};

export const viewport: Viewport = {
  themeColor: "#3155F5",
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
      className={`${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen bg-[#F5F1E8] text-[#171717] antialiased selection:bg-[#E9F56A] selection:text-[#171717]">
        <StorageSanitizer />
        {children}
      </body>
    </html>
  );
}
