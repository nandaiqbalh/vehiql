import {Inter} from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import {ClerkProvider} from "@clerk/nextjs";
import {Toaster} from "sonner";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Vehiql",
    description: "Find your dream car",
};

export default function RootLayout({children}) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body className={`${inter.className}`}>
            <Header/>

            <main className="min-h-screen">{children}</main>
            <Toaster richColors/>

            <footer className="bg-blue-50 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">
                        <a
                            href="https://www.linkedin.com/in/nandaiqbalh/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            @nandaiqbalh
                        </a>{" "}
                        |{" "}
                        <span className="text-sm text-muted-foreground">
        <a
            href="https://www.youtube.com/watch?v=HyGi_SjQqV4"
            target="_blank"
            rel="noopener noreferrer"
        >
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
