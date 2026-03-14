import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hugmuseum.vercel.app"),
  title: "Hug Museum",
  description: "A live digital hug wall for sharing photos, videos, and stories of hugs.",
  openGraph: {
    title: "Hug Museum",
    description: "A live digital hug wall for sharing photos, videos, and stories of hugs.",
    url: "/",
    siteName: "Hug Museum",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hug Museum preview image",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hug Museum",
    description: "A live digital hug wall for sharing photos, videos, and stories of hugs.",
    images: ["/og-image.jpg"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
