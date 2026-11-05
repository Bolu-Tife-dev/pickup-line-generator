import { Toaster } from "@/components/ui/sonner";
import RegisterServiceWorker from "@/components/pwa/register-sw";
import type { Metadata, Viewport } from "next";
import PlausibleProvider from "next-plausible";
import { Grand_Hotel } from "next/font/google";
import "./globals.css";

const titlefont = Grand_Hotel({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Pickup Line Generator | Generate pickup line for your crush now!",
  description: "Generate one for me",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Pickup Line",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

// iOS Safari PWA viewport: cover the notch/home-indicator area only
// when running from the home screen.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FED8D8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <PlausibleProvider domain={process.env.NEXT_PUBLIC_APP_DOMAIN!}>
        <body className={titlefont.className}>
          <main>{children}</main>
          <Toaster richColors />
          <RegisterServiceWorker />
        </body>
      </PlausibleProvider>
    </html>
  );
}
