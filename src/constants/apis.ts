import { TExchange } from "#/src/types/exchange.type";

export const EXCHANGE_API_URL_MAP: Record<TExchange, string> = {
  BYBIT: "https://api.bybit.com",
  BINANCE: "https://api.binance.com",
  OKX: "https://www.okx.com",
  BITGET: "https://api.bitget.com",
  BITHUMB: "https://api.bithumb.com",
};
