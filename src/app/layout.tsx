// import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata(
  "ФотоСеть - делись моментами",
  "ФотоСеть - социальное приложение для обмена фотографиями.",
  "/favicon.ico"
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          {/* <Header /> */}
          <main className="content container">{children}</main>
          {/* <Footer /> */}
        </AuthProvider>
      </body>
    </html>
  );
}
