import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARX-01 | Operations Console",
  description: "Autonomous Revenue Recovery Control Console",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} dark bg-black text-zinc-200 antialiased font-mono`}>
      <body className="min-h-screen bg-black text-zinc-200 font-mono flex flex-col antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
