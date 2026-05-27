import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  JetBrains_Mono,
  Bebas_Neue,
} from "next/font/google";
import "./globals.css";

// Body — clean sans-serif (VIBES.md)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Headers — formal serif
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

// Stats / numbers — "data dashboard" monospace
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// Usernames / meme text — chunky display (single weight, not variable)
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "MBG Clicker — Kementerian Makan Bergizi Gratis",
  description:
    "Dashboard operasional nasional pengemasan Makan Bergizi Gratis. Kemas makanan bareng-bareng, jaga stabilitas kotak nasional, jangan kelewat semangat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
