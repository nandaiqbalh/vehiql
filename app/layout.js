import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vehicle",
  description: "Find your dream car",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />

          <main className="min-h-screen">{children}</main>
          <Toaster richColors/>

          <footer className={`bg-blue-50 py-12`}>
            <div className="container mx-auto px-4 text-center">
              <p className={`text-sm`}>
                @nandaiqbalh |{" "}
                <span className="text-sm text-muted-foreground">
                  <a href="https://www.youtube.com/watch?v=HyGi_SjQqV4">
                    Reference
                  </a>
                </span>
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
