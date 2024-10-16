import { TExchange } from "#/types/exchange.type";

export const EXCHANGE_API_URL_MAP: Record<TExchange, string> = {
  BYBIT: "https://api.bybit.com",
  BINANCE: "https://api.binance.com",
  //   OKX: "https://www.okx.com",
  //   BITGET: "https://api.bitget.com",
  //   BITHUMB: "https://api.bithumb.com",
};

export type TInterval = "one_hour" | "four_hour" | "day" | "week";
