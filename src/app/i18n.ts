import { initReactI18next } from "react-i18next/initReactI18next";

import { Resource, createInstance, i18n } from "i18next";

import i18nConfig from "#/i18n.config";
// import enHeader from "#/locales/en/header.json";
// import enHome from "#/locales/en/home.json";
// import koHeader from "#/locales/ko/header.json";
// import koHome from "#/locales/ko/home.json";

const resources: Resource = {
  // en: {
  //   home: enHome,
  //   header: enHeader,
  // },
  // ko: {
  //   home: koHome,
  //   header: koHeader,
  // },
};

export const namespaces = ["home", "header"];

export const initTranslations = async (locale: string, i18nInstance?: i18n) => {
  const instance = i18nInstance || createInstance();

  instance.use(initReactI18next);

  await instance.init({
    resources,
    lng: locale,
    fallbackLng: i18nConfig.defaultLocale,
    supportedLngs: i18nConfig.locales,
    defaultNS: namespaces[0],
    fallbackNS: namespaces,
    ns: namespaces,
    preload: resources ? [] : i18nConfig.locales,
  });

  return { i18n: instance, t: instance.t };
};
