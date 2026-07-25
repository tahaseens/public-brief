import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "PublicBrief DMV | Understanding public decisions",
  description:
    "Explore source-linked local agenda items or turn a public notice into a clear, evidence-grounded brief.",
  openGraph: {
    title: "PublicBrief DMV",
    description: "Local government decisions before the vote",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "PublicBrief DMV" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PublicBrief DMV",
    description: "Local government decisions before the vote",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
