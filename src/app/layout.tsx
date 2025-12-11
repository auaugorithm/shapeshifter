import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC Video Creator",
  description: "Create scroll-stopping short-form videos with AI-powered scripts, voiceovers, and visuals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
