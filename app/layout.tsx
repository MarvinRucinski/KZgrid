import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KŻ GeoGrid",
  description: "GeoGrid for KŻ PWr",
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

