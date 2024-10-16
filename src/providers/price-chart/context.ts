import PublicSocket from "#/src/services/socket/public";
import { TExchange } from "#/src/types/exchange.type";
import { createContext, useContext } from "react";

interface PriceChartContextType {
  socketInstance: PublicSocket | null;
  symbol: string;
  exchange: TExchange;
  interval: string;
}


const PriceChartContext = createContext<PriceChartContextType | null>(null);

// Custom hook to use the context in child components
export const usePriceChartContext = () => {
  const context = useContext(PriceChartContext);
  if (!context) {
    throw new Error(
      "usePriceChartContext must be used within a PriceChartProvider",
    );
  }
  return context;
};

export default PriceChartContext;
