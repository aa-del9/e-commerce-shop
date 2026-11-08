import { BotIdClient } from "botid/client";
import type { Metadata, Viewport } from "next";

import "./globals.css";
import { Suspense } from "react";

import { brand } from "@/brand/config";
import { fontVariables } from "@/brand/fonts";
import { AnnouncementBar } from "@/brand/sections/announcement-bar";
import { WhatsAppButton } from "@/brand/sections/whatsapp-button";
import { ActionBar } from "@/components/action-bar";
import { AgentButton } from "@/components/agent/agent-button";
import { AnalyticsComponents } from "@/components/analytics";
import { CartUI } from "@/components/cart/cart-ui";
import { CartProviderWrapper } from "@/components/cart/context";
import { CartStandardActionsScript } from "@/components/cart/standard-actions";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { SiteSchema } from "@/components/schema/site-schema";
import { botIdProtectedRoutes } from "@/lib/botid";
import { seedCartData } from "@/lib/cart/server";
import { shopConfig } from "@/lib/config";

export const ensureStatic = "prefetch";

export const viewport: Viewport = {
  themeColor: brand.seo.themeColor,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Un-awaited: the promise streams to the client provider; never block the shell on it.
  const cartData = seedCartData();
  return (
    <html lang={shopConfig.localization.locale}>
      <head>
        {shopConfig.botid.isEnabled && <BotIdClient protect={botIdProtectedRoutes} />}
        <CartStandardActionsScript />
      </head>
      <body className={`${fontVariables} flex min-h-dvh flex-col font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-background focus:px-5 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-foreground focus:outline-none"
        >
          Skip to content
        </a>
        <SiteSchema />

        <CartProviderWrapper cartData={cartData}>
          <Suspense fallback={null}>
            <AnnouncementBar />
          </Suspense>
          <Nav />
          <main id="main-content" className="flex flex-1 flex-col min-w-0">
            {children}
          </main>
          <Footer />
          <CartUI />
          {brand.features.whatsappButton ? (
            <WhatsAppButton
              defaultMessage={`Hi ${brand.identity.name}, I have a question.`}
              label="Chat with us on WhatsApp"
              raised={shopConfig.agent.isEnabled}
              siteUrl={shopConfig.site.url}
            />
          ) : null}
          <Suspense>
            <ActionBar>{shopConfig.agent.isEnabled && <AgentButton />}</ActionBar>
          </Suspense>
          <Suspense>
            <AnalyticsComponents />
          </Suspense>
        </CartProviderWrapper>
      </body>
    </html>
  );
}

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    description: brand.seo.defaultDescription,
    generator: shopConfig.site.name,
    metadataBase: new URL(shopConfig.site.url),
    openGraph: {
      images: [{ url: brand.seo.defaultOgImage, width: 1200, height: 628 }],
    },
    ...(brand.seo.twitterHandle
      ? { twitter: { creator: brand.seo.twitterHandle, site: brand.seo.twitterHandle } }
      : {}),
    title: {
      default: shopConfig.site.name,
      template: brand.seo.titleTemplate,
    },
  };
};
