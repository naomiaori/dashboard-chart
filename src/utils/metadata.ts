import { ALTERNATE_NAME, BRAND_NAME } from "#/src/constants/name";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    alternateName: ALTERNATE_NAME,
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
  },
];

export default jsonLd;
