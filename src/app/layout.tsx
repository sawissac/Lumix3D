import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { MobileBlocker } from "@/components/MobileBlocker";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lumix3D - SVG to 3D Converter",
  description:
    "Transform SVG files into interactive 3D models with cinematic lighting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body className={inter.className}>
        <MobileBlocker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
