import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEC Hostel Portal",
  description: "Hostel Leave Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased font-sans text-slate-900 bg-slate-50"
      >
        {children}
      </body>
    </html>
  );
}
