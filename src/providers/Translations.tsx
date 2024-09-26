import { PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";

import { createInstance } from "i18next";

import { initTranslations } from "#/src/app/i18n";

const TranslationsProvider = ({
  children,
  locale,
}: PropsWithChildren<{ locale: string }>) => {
  const i18n = createInstance();

  initTranslations(locale, i18n);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default TranslationsProvider;
