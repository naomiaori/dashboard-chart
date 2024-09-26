import React from "react";

import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { BRAND_NAME } from "#/constants/name";

import AppProvider from "#/providers/index";

import jsonLd from "#/utils/metadata";

import { firaMono } from "#/styles/fonts";

import Maintenance from "#/src/views/maintenance";
import "#/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      default: BRAND_NAME,
      template: `${BRAND_NAME} | %s`,
    },
    description: "",
    keywords: ["Legal", "Finance", "Quant"],
    // metadataBase: new URL(`${process.env.NEXT_PUBLIC_CENTRAL_URL}`),
    // 	openGraph: {
    // 		title,
    // 		description,
    // 		url: `/`,
    // 		siteName: BRAND_NAME,
    // 		images: [
    // 			{
    // 				url: `/og/small.png`,
    // 				width: 600,
    // 				height: 315,
    // 			},
    // 			{
    // 				url: `/og/large.png`,
    // 				width: 1200,
    // 				height: 600,
    // 			},
    // 		],
    // 		type: 'website',
    // 	},
    // 	twitter: {
    // 		card: 'summary_large_image',
    // 		title,
    // 		description,
    // 		site: BRAND_NAME,
    // 		images: [`/og/twitter.png`],
    // 	},
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en" className={`${firaMono.className} dark`}>
    <body>
      {process.env.NEXT_PUBLIC_MAINTENANCE === "true" ? (
        <Maintenance />
      ) : (
        <AppProvider>{children}</AppProvider>
      )}
    </body>
    <Script
      id="script"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  </html>
);

export default RootLayout;
