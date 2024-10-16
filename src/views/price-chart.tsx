"use client";

import TradingViewChart from "#/components/line-chart";
import { INTERVAL } from "#/constants/intervals";
import PriceChartProvider from "#/providers/price-chart/price-chart";
import { TExchange } from "#/types/exchange.type";
import { TSelectedInterval, TSymbol, TlpPrice } from "#/types/price-chart.type";

type TPriceChart = {
  exchange: TExchange;
  symbol: TSymbol;
  interval: TSelectedInterval;
  lpLinePrice: TlpPrice;
};

export default function PriceChart({
  exchange,
  symbol,
  interval,
  lpLinePrice,
}: TPriceChart) {

  const exchangeInterval =
    INTERVAL[exchange as keyof typeof INTERVAL][
      interval as keyof (typeof INTERVAL)[typeof exchange]
    ];

  return (
    <PriceChartProvider
      exchange={exchange}
      symbol={symbol}
      interval={exchangeInterval}
    >
      <section className="w-[37.56rem] px-6 py-6 flex flex-col items-center">
        <div className="w-full flex justify-between mb-[1.13rem]">
          <span className="font-bold text-base">
            {symbol.replace("-", "/")}
          </span>
          <span className="text-[0.625rem] font-500">
            Liquidation Price : 54330.03
          </span>
        </div>
        <div className="w-full h-[240px]">
          <TradingViewChart
            exchange={exchange}
            symbol={symbol}
            offsetInterval={interval}
            interval={exchangeInterval}
            lpLinePrice={lpLinePrice}
          />
        </div>
        <div className="w-full flex text-[0.625rem] gap-7 mt-[1.69rem]">
          <div className="flex gap-3">
            <span className="font-bold text-gray-100">USDT</span>
            <span className="text-white">90,000,000 USDT</span>
          </div>
          <div className="flex gap-3 justify-start">
            <span className="font-bold text-gray-100">TOKEN</span>
            <span className="text-white">
              12,000,000 BTC (812,390,000 USDT)
            </span>
          </div>
        </div>
      </section>
    </PriceChartProvider>
  );
}
