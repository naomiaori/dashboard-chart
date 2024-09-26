import { Config } from "next-i18n-router/dist/types";

const i18nConfig: Config = {
  locales: ["en", "ko"],
  defaultLocale: "en",
  prefixDefault: true,
  localeDetector: false as const,
};

export default i18nConfig;
