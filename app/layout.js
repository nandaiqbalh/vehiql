import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({subsets: ["latin"]});


export const metadata = {
  title: "Vehicle",
  description: "Find your dream car",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}`}
      >

        <Header/>
        
        <main className="min-h-screen">{children}</main>

        <footer className={`bg-blue-50 py-12`}>
          <div className="container mx-auto px-4 text-center">
            <p>
              Made with ❤️ by Nanda |{" "}
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
  );
}
