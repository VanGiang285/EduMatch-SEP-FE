import type { Metadata } from "next";
import "../styles/globals.css";
import { ClientProviders } from "./ClientProviders";
export const metadata: Metadata = {
  title: "EduMatch - Học tập thông minh",
  description: "Kết nối với gia sư chuyên nghiệp, học 1-kèm-1 trực tuyến",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: ["gia sư", "học tập", "1-kèm-1", "trực tuyến", "giáo dục"],
  authors: [{ name: "EduMatch Team" }],
  robots: "index, follow",
  openGraph: {
    title: "EduMatch - Học tập thông minh",
    description: "Kết nối với gia sư chuyên nghiệp, học 1-kèm-1 trực tuyến",
    type: "website",
    locale: "vi_VN",
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}