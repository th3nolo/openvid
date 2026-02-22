import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freeshot - Crea tomas cinemáticas",
  description: "Genera tomas cinematográficas con facilidad",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%230E0E12' stroke='%233B82F6' stroke-width='2'/><circle cx='16' cy='16' r='6' fill='%233B82F6'/></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased dark`}>
        {children}
      </body>
    </html>
  );
}