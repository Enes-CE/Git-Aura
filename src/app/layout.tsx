import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: {
    default: "GitAura | Ultimate GitHub Profiler",
    template: "%s | GitAura",
  },
  description: "Analyze GitHub profiles with a cinematic, high-end experience. Discover your developer persona, impact score, and global ranking.",
  keywords: ["GitHub", "profile analyzer", "developer analytics", "GitHub stats", "code analysis"],
  authors: [{ name: "GitAura Team" }],
  creator: "GitAura",
  publisher: "GitAura",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "GitAura",
    title: "GitAura | Ultimate GitHub Profiler",
    description: "Analyze GitHub profiles with a cinematic, high-end experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GitAura - Ultimate GitHub Profiler",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GitAura | Ultimate GitHub Profiler",
    description: "Analyze GitHub profiles with a cinematic, high-end experience.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} bg-background text-foreground min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider>
              {children}
              <Toaster 
                position="top-right" 
                richColors 
                closeButton
                theme="dark"
                toastOptions={{
                  style: {
                    background: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    color: "#f8fafc",
                  },
                }}
              />
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
