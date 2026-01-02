import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Poppins} from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';

const poppins = Poppins({
subsets: ['latin'],
weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
variable: '--font-poppins',
})

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
  description: "Simulate full seasons of drag race!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-poppins antialiased`}
      >
        {children}
        <Analytics />
      </body>
      
    </html>
  );
}
