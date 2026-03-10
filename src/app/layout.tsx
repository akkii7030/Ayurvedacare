import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "@/index.css";
import AppProviders from "@/components/providers/AppProviders";

const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sharavat Pali Clinic - TeleCare and 24x7 Emergency | Jaunpur",
  description:
    "Sharavat Pali Clinic at Kushaha Road, Singra Mau, Jaunpur offers 24x7 emergency care, ICU support, eye care, Ayurveda treatment and telemedicine booking.",
  keywords: [
    "Hospital in Jaunpur",
    "Emergency care in Singra Mau",
    "Ayurvedic doctor in Jaunpur",
    "ICU",
    "Telecare",
    "Cataract"
  ],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`} suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
