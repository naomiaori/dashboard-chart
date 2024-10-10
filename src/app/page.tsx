"use client"; 

import PriceChart from "../views/price-chart";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="">
        <PriceChart exchange={"BINANCE"} symbol={"BTCUSDT"} interval={"1h"} lpLinePrice={0} />
      </main>
    </QueryClientProvider>
  );
}
