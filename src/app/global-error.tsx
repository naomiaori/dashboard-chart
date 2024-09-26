"use client";

import Link from "next/link";

import { firaMono } from "#/styles/fonts";

import routerMap from "#/src/constants/router";

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => (
  <html lang="en" className={`${firaMono.variable} dark`}>
    <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center">
        <h2 className="primary-clip-text mt-3 text-[3rem] font-bold">
          500 ERROR
        </h2>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
      <Link
        href={routerMap.HOME}
        replace
        className="primary-line-button-lg mt-[22rem] w-full max-w-[16.875rem] text-center"
      >
        Home
      </Link>
    </body>
  </html>
);

export default GlobalError;
