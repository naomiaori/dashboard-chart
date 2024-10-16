import { TExchange } from "../types/exchange.type";
import { TBase, TSymbol } from "../types/price-chart.type";

export const convertSymbol = (
  symbol: TSymbol,
  base: TBase,
  format: "base-quote" | "quote-base" | "underscore" = "base-quote",
) => {
  if (!base) return symbol;

  const basePart = base;
  const quotePart = symbol.slice(base.length);

  switch (format) {
    case "base-quote":
      return `${basePart}-${quotePart}`;
    case "quote-base":
      return `${quotePart}-${basePart}`;
    case "underscore":
      return `${basePart}_${quotePart}`;
    default:
      return symbol;
  }
};

export const convertSymbolForExchange = (
  exchange: TExchange,
  symbol: TSymbol,
  base: TBase,
) => {
  switch (exchange) {
    // case 'OKX':
    // 	return convertSymbol(symbol, base, 'base-quote')
    // case 'BITHUMB':
    // 	return convertSymbol(symbol, base, 'underscore')
    default:
      return symbol;
  }
};
