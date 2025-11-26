import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PluginInitializer } from "@/components/PluginInitializer";
import { ServiceProvider } from "@/services/service-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProxNCut",
  description: "Proxy Generator with Silhouette Cut Support",
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
        <PluginInitializer />
        <ServiceProvider>
          {children}
        </ServiceProvider>
      </body>
    </html>
  );
}
