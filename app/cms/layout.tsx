import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "SUNNIT CMS",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
