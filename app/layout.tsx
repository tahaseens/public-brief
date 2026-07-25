import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PublicBrief: Understand local decisions",
  description: "Turn dense local-government notices into clear, source-grounded public briefs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
