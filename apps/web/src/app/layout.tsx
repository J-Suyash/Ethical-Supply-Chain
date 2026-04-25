import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ethical Supply Chain Tracking System",
  description:
    "Blockchain-powered ethical supply chain with threshold-based authority validation on Sepolia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
