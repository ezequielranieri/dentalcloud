import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import DemoCleanup from "@/components/DemoCleanup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DentalCloud Manager",
  description: "Gestión Odontológica Eficiente",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans">
        <DemoCleanup />
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {children}
          </main>

          <BottomNav />
        </div>
      </body>
    </html>
  );
}
