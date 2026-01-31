import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feedly News Dashboard",
  description: "A clean dashboard to view and organize your Feedly news feeds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
