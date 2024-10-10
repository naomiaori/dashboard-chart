// import axios from 'axios';
// import { useQuery } from '@tanstack/react-query';
// import { TExchange, TInterval, TSymbol } from "../types/price-chart.type";

// type TPriceChart = {
//     exchange: TExchange;
//     symbol: TSymbol;
//     interval: TInterval;
//     start: string;
//     end: string;
//     limit?: number
// }

// export const EXCHANGE_API_URL_MAP = {
// 	BYBIT: 'https://api.bybit.com/v5/market/kline',
// 	BINANCE: 'https://api.binance.com',
// }

// const klineKeys = {
// 	all: ['all'] as const,
// 	kline: (exchange: string) => [...klineKeys.all, 'kline', exchange] as const,
// }

// const getBybitKlines = async ({ symbol, interval, start, end, limit=200 }: TPriceChart) => {
//   const response = await axios.get(`${EXCHANGE_API_URL_MAP.BYBIT}`, {
//     params: {
//       symbol,
//       interval,
//       start,
//       end,
//       limit
//     },
//   });

//   if (response.data.retCode !== 0) {
//     throw new Error(response.data.retMsg || 'Failed to fetch klines');
//   }

//   return response.data.result.list; 
// };

// export const useRKlines = ({ exchange, symbol, interval, start, end }) => {
//     const query = useQuery({
//       queryKey: klineKeys.kline(exchange), 
//       queryFn: () => getBybitKlines({ symbol, interval, start, end }),
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//       refetchOnMount: false,
//       throwOnError: true,
//     });
  
//     // Expose refetch function with dynamic parameters
//     return {
//       ...query,
//       refetchWithParams: (newStart, newEnd) => query.refetch({
//         queryFn: () => getBybitKlines({ symbol, interval, start: newStart, end: newEnd })
//       })
//     };
//   };



import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { TExchange, TInterval, TSymbol } from "../types/price-chart.type";

type TPriceChart = {
    exchange: TExchange;
    symbol: TSymbol;
    interval: TInterval;
    start: string;
    end: string;
    limit?: number;
}

export const EXCHANGE_API_URL_MAP = {
    BYBIT: 'https://api.bybit.com/v5/market/kline',
    BINANCE: 'https://api.binance.com/api/v3/klines',
}

const klineKeys = {
    all: ['all'] as const,
    kline: (exchange: string) => [...klineKeys.all, 'kline', exchange] as const,
}

interface IUnifiedKlineData {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
}


const getBybitKlines = async ({ symbol, interval, start, end, limit=200 }: TPriceChart): Promise<IUnifiedKlineData[]> => {
    const response = await axios.get(`${EXCHANGE_API_URL_MAP.BYBIT}`, {
        params: {
            symbol,
            interval,
            start,
            end,
            limit
        },
    });

    if (response.data.retCode !== 0) {
        throw new Error(response.data.retMsg || 'Failed to fetch Bybit klines');
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


const getBinanceKlines = async ({ symbol, interval, start, end, limit=500 }: TPriceChart): Promise<IUnifiedKlineData[]> => {
    const response = await axios.get(`${EXCHANGE_API_URL_MAP.BINANCE}`, {
        params: {
            symbol,
            interval,
            startTime: start,
            endTime: end,
            limit
        },
    });

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


const getKlinesMap: Record<TExchange, (params: TPriceChart) => Promise<IUnifiedKlineData[]>> = {
    BYBIT: getBybitKlines,
    BINANCE: getBinanceKlines,
};

export const useRKlines = ({ exchange, symbol, interval, start, end, limit }: TPriceChart) => {
    const query = useQuery({
        queryKey: klineKeys.kline(exchange),
        queryFn: () => getKlinesMap[exchange]({ symbol, interval, start, end, limit }),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
        throwOnError: true,
    });

    return {
        ...query,
        refetchWithParams: (newStart: string, newEnd: string) => query.refetch({
            queryFn: () => getKlinesMap[exchange]({ symbol, interval, start: newStart, end: newEnd, limit })
        }),
    };
};

  