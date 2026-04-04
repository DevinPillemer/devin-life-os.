import type { Metadata } from "next";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Floopify v2 — Life OS Dashboard",
  description: "Daily tracking dashboard for health, habits, finance, goals, and learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary min-h-screen">
        <Sidebar />
        <main className="ml-[240px] min-h-screen p-8 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}
