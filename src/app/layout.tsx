import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRAP DETECTOR | Blockchain Security Protocol",
  description: "Real-time signature request analyzer protecting your assets from malicious transactions on Base Mainnet",
  keywords: ["blockchain", "security", "Base", "Ethereum", "Web3", "transaction analyzer"],
  authors: [{ name: "Trap Detector" }],
  openGraph: {
    title: "TRAP DETECTOR",
    description: "Protect your assets from malicious transactions",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
