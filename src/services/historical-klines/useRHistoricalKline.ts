import { useQuery, useQueryClient } from "@tanstack/react-query";
import { historicalKlinesKeys } from "#/services/historical-klines/keys";
import { getHistoricalKlinesMap } from "#/services/historical-klines/queryFn";
import { TExchange, TInterval, TSymbol } from "#/src/types/price-chart.type";

export type THistoricalKlinesArgs = {
  exchange: TExchange;
  symbol: TSymbol;
  interval: TInterval;
  start: string;
  end: string;
  limit?: number;
};

export const useRHistoricalKlines = ({
  exchange,
  symbol,
  interval,
  start,
  end,
  limit,
}: THistoricalKlinesArgs) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: historicalKlinesKeys.kline(
      exchange,
      symbol,
      interval,
      start,
      end,
    ),
    queryFn: () =>
      getHistoricalKlinesMap[exchange]({ symbol, interval, start, end, limit }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    throwOnError: true,
  });

  const refetchWithParams = (newStart: string, newEnd: string) => {
    queryClient.refetchQueries({
      queryKey: historicalKlinesKeys.kline(
        exchange,
        symbol,
        interval,
        newStart,
        newEnd,
      ),
      exact: true,
    });
  };

  return {
    ...query,
    refetchWithParams,
  };
};
