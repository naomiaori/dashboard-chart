"use client";

import PriceChart from "#/views/price-chart";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TSelectedInterval } from "#/types/price-chart.type";

const queryClient = new QueryClient();

const intervals = [
  { label: "1h", value: "one_hour" },
  { label: "4h", value: "four_hour" },
  { label: "1d", value: "day" },
  { label: "1w", value: "week" },
] as const;



export default function Home() {
  const [interval, setInterval] = useState<TSelectedInterval>("one_hour");

  const handleIntervalChange = (selectedInterval: TSelectedInterval) => {
    setInterval(selectedInterval);
  };

  const IntervalButton = ({
    label,
    value,
  }: {
    label: string;
    value: TSelectedInterval;
  }) => (
    <button
      className={`text-xs py-2 px-3 border border-gray-1100 ${
        interval === value
          ? "bg-gray-1100 text-white"
          : "bg-transparent text-gray-1300"
      }`}
      onClick={() => handleIntervalChange(value)}
    >
      {label}
    </button>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <main className="w-full">
        <div className="p-3">
          {intervals.map((int) => (
            <IntervalButton
              key={int.value}
              label={int.label}
              value={int.value}
            />
          ))}
        </div>
        <div className="flex">
          <PriceChart
            exchange={"BYBIT"}
            symbol={"BTCUSDT"}
            interval={interval}
            lpLinePrice={67000}
          />
          <PriceChart
            exchange={"BINANCE"}
            symbol={"BTCUSDT"}
            interval={interval}
            lpLinePrice={0}
          />
        </div>
      </main>
    </QueryClientProvider>
  );
}
