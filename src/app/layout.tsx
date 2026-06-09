import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NotificationListener } from "@/components/NotificationListener";
import { AuthProvider } from "@/lib/auth-context";
import { AuthNav } from "@/components/AuthNav";

export const metadata: Metadata = {
  title: "نظام إدارة القسم الأكاديمي",
  description:
    "نظام شامل لإدارة القسم الأكاديمي يشمل إدارة الإعلانات والمقررات والطلبات الأكاديمية",
  keywords: [
    "إدارة أكاديمية",
    "قسم أكاديمي",
    "جامعة",
    "إعلانات",
    "مقررات دراسية",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground min-h-screen" suppressHydrationWarning>
        <AuthProvider>
          <AuthNav />
          {children}
        </AuthProvider>
        <Toaster position="top-left" dir="rtl" richColors />
        <NotificationListener />
      </body>
    </html>
  );
}
