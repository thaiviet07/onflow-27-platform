import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onflow Library — 3D Assets, Surfaces & HDRIs",
  description:
    "Browse 5,440+ scanned 3D models, calibrated PBR surfaces, and 32-bit HDRI environments for Unreal Engine, Blender, Maya, and Unity.",
  icons: {
    icon: "/favicon-logo-dark.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f0f0f0] text-[#19213d]">
        {children}
      </body>
    </html>
  );
}
