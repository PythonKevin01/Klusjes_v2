import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const metadata: Metadata = {
  title: "Klusjes v2 - Taak Management App",
  description: "Een moderne React-applicatie voor het beheren van klusjes per kamer. Gebouwd met Next.js 15, React 19, TypeScript en Tailwind CSS.",
  keywords: ["klusjes", "taken", "taak management", "productiviteit", "organisatie"],
  authors: [{ name: "Klusjes App" }],
  creator: "Klusjes App",
  publisher: "Klusjes App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Klusjes v2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="white" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="black" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-bricolage antialiased">
        <ErrorBoundary>
          <ThemeProvider
            defaultTheme="system"
            storageKey="klusjes-ui-theme"
          >
            <ToastProvider>
              <div className="min-h-screen bg-background text-foreground">
                <main className="relative">
                  {children}
                </main>
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 