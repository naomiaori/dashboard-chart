import axios from "axios";
import { TInterval, TSymbol } from "#/types/price-chart.type";
import { EXCHANGE_API_URL_MAP } from "#/constants/apis";
import { TExchange } from "#/src/types/exchange.type";

export type TGetKlinesArgs = {
  symbol: TSymbol;
  interval: TInterval;
  start: string;
  end: string;
  limit?: number;
};

const getBybitKlines = async ({
  symbol,
  interval,
  start,
  end,
  limit = 200,
}: TGetKlinesArgs) => {
  const response = await axios.get(
    `${EXCHANGE_API_URL_MAP.BYBIT}/v5/market/kline`,
    {
      params: {
        symbol,
        interval,
        start,
        end,
        limit,
      },
    },
  );

  if (response.data.retCode !== 0) {
    throw new Error(response.data.retMsg || "Failed to fetch Bybit klines");
  }

  return response.data.result.list.map((kline: (string | number)[]) => ({
    openTime: Number(kline[0]),
    open: String(kline[1]),
    high: String(kline[2]),
    low: String(kline[3]),
    close: String(kline[4]),
    volume: String(kline[5]),
    closeTime: Number(kline[6]),
  }));
};
const getBinanceKlines = async ({
  symbol,
  interval,
  start,
  end,
  limit = 1500,
}: TGetKlinesArgs) => {
  const response = await axios.get(
    `${EXCHANGE_API_URL_MAP.BINANCE}/api/v3/klines`,
    {
      params: {
        symbol,
        interval,
        startTime: start,
        endTime: end,
        //   limit,
      },
    },
  );

  return response.data.map((kline: (string | number)[]) => ({
    openTime: Number(kline[0]),
    open: String(kline[1]),
    high: String(kline[2]),
    low: String(kline[3]),
    close: String(kline[4]),
    volume: String(kline[5]),
    closeTime: Number(kline[6]),
  }));
};

export const getHistoricalKlinesMap: Record<
  TExchange,
  (args: TGetKlinesArgs) => Promise<any>
> = {
  BYBIT: getBybitKlines,
  BINANCE: getBinanceKlines,
};
