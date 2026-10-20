import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Codex Studio",
  description: "Your video, your timeline, your creative workspace.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark antialiased">{children}</body>
    </html>
  );
}
