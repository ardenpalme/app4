import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ardenpalme.com"),

  title: {
    default: "Arden Diakhate-Palme | Software Engineer",
    template: "%s | Arden Diakhate-Palme",
  },

  description:
    "Personal portfolio of Arden Diakhate-Palme — Software Engineer specializing in machine learning.",

  keywords: [
    "Arden Diakhate-Palme",
    "Software Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "React",
    "TypeScript",
    "Pytorch",
    "Investment Strategies",
  ],

  authors: [{ name: "Arden Diakhate-Palme" }],
  creator: "Arden Diakhate-Palme",

  openGraph: {
    title: "Arden Diakhate-Palme | Developer",
    description:
      "Software Engineer specializing in machine learning.",
    url: "https://ardenpalme.com",
    siteName: "Arden Diakhate-Palme",
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "Arden Diakhate-Palme | Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
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

  alternates: {
    canonical: "https://ardenpalme.com",
  },

  category: "technology",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
