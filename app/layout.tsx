import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { CartProvider } from "@/lib/cart-context";
import { SettingsProvider } from "@/lib/settings-context";
import VerifyBanner from "@/components/ui/verify-banner";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "আমার টিম — Amar Team",
  description: "Hire football players, coaches, referees & cameramen in Bangladesh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${inter.className} bg-dark text-white`} suppressHydrationWarning>
        <SettingsProvider>
  <LanguageProvider>
    <AuthProvider>
      <CartProvider>
        {children}
        <VerifyBanner />
      </CartProvider>
    </AuthProvider>
  </LanguageProvider>
</SettingsProvider>
      </body>
    </html>
  );
}