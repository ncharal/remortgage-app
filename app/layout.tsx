import "./globals.css";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import SiteFooter from "@/components/SiteFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Remortgage Comparison App",
  description:
    "Compare remortgage options easily — see monthly repayments, total costs, and balances side by side.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Consent Mode v2 (default denied) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
              });
            `,
          }}
        />
        {/* AdSense – replace with your publisher ID */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXX"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <CookieBanner />
        <main className="flex-grow">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
