import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageLayout } from "@/components/layout/PageLayout";
import { BootstrapClient } from "@/components/layout/BootstrapClient";
import "bootstrap/dist/css/bootstrap.min.css";
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
  title: "Tunacosplay",
  description: "Explore amazing cosplay collections",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BootstrapClient />
        <PageLayout>{children}</PageLayout>
      </body>
    </html>
  );
}
