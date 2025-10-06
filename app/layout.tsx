// app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Remortgage Options Comparison App",
  description:
    "Compare remortgage options — monthly repayments, total costs, and balances side by side.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Consent Mode v2 default (UK/EEA compliance) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('consent', 'default', {
                  'ad_storage': 'denied',
                  'ad_user_data': 'denied',
                  'ad_personalization': 'denied',
                  'analytics_storage': 'denied'
                });
              })();
            `,
          }}
        />
        {/* Google AdSense – replace with your Publisher ID */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3153229824650084"
     crossorigin="anonymous"></script>
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50`}>
        <CookieBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
