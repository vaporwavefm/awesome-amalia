import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';
import { Inter } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});



const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

/*
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

*/

export const metadata: Metadata = {
  title: "Rupaul's Drag Race Simulator",
  description: "Simulate full seasons of Rupaul's Drag Race! Select or import your own custom queens, select which challenges the queens will have to face (for example: musicals, snatch game, roasts, acting challenges!). You can also control other factors such as finale styles, premiere styles, and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakarta.variable} font-jakarta antialiased`}
      >
        {children}
        <Analytics />
      </body>
      
    </html>
  );
}
