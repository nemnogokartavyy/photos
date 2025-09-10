import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthContent from "@/components/AuthContent";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <AuthContent>
            <Header />
            <main className="content container">{children}</main>
            <Footer />
          </AuthContent>
        </AuthProvider>
      </body>
    </html>
  );
}
