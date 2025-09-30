import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "EduMatch - Học tập thông minh",
  description: "Kết nối với gia sư chuyên nghiệp, học 1-kèm-1 trực tuyến",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
