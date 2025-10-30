import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyFundAction - Peer-to-Peer Giving Platform",
  description: "Amplify generosity through gamified peer-to-peer fundraising for Islamic charity and humanitarian causes",
  keywords: ["fundraising", "charity", "Islamic giving", "Zakat", "Sadaqah", "peer-to-peer", "Malaysia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
