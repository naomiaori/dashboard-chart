/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: false,
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
        use: ["@svgr/webpack"],
      },
    );
    fileLoaderRule.exclude = /\.svg$/i;

    // alias configuration
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   "#": path.resolve(__dirname),
    //   "#/public": path.resolve(__dirname, "public"),
    //   "#/app": path.resolve(__dirname, "src/app"),
    //   "#/components": path.resolve(__dirname, "src/components"),
    //   "#/constants": path.resolve(__dirname, "src/constants"),
    //   "#/hooks": path.resolve(__dirname, "src/hooks"),
    //   "#/libs": path.resolve(__dirname, "src/libs"),
    //   "#/actions": path.resolve(__dirname, "src/actions"),
    //   "#/mock-data": path.resolve(__dirname, "src/mock-data"),
    //   "#/providers": path.resolve(__dirname, "src/providers"),
    //   "#/services": path.resolve(__dirname, "src/services"),
    //   "#/stores": path.resolve(__dirname, "src/stores"),
    //   "#/locales": path.resolve(__dirname, "src/locales"),
    //   "#/styles": path.resolve(__dirname, "src/styles"),
    //   "#/types": path.resolve(__dirname, "src/types"),
    //   "#/utils": path.resolve(__dirname, "src/utils"),
    //   "#/views": path.resolve(__dirname, "src/views"),
    // };

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
