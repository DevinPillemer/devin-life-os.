import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floopify v2 — Life Dashboard",
  description: "Your personal life operating system dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
