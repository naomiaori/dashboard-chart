export const historicalKlinesKeys = {
  all: ["all"] as const,
  kline: (
    exchange: string,
    symbol: string,
    interval: string,
    start: string,
    end: string,
  ) =>
    [
      ...historicalKlinesKeys.all,
      "historicalKlines",
      exchange,
      symbol,
      interval,
      start,
      end,
    ] as const,
};
