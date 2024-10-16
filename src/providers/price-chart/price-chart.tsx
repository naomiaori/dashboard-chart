import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import PublicSocket from "#/src/services/socket/public";
import PriceChartContext from "./context";
import { SOCKET_OPTIONS, SOCKET_URL_MAP } from "#/src/constants/sockets";
import { TExchange } from "#/src/types/exchange.type";

type TProps = {
  symbol: string;
  exchange: TExchange;
  interval: string;
  children: React.ReactNode;
}

const PriceChartProvider: React.FC<TProps> = ({
  symbol,
  exchange,
  interval,
  children,
}) => {
  const queryClient = useQueryClient();
  const [socketInstance, setSocketInstance] = useState<PublicSocket | null>(null);

  // Initialize the WebSocket only once when the component mounts
  useEffect(() => {
    const socket = new PublicSocket(
      SOCKET_URL_MAP[exchange],
      SOCKET_OPTIONS[exchange],
      symbol,
      exchange,
      interval,
      queryClient,
    );

    setSocketInstance(socket);

    return () => {
      socket.disconnect(); 
    };
  }, []); 
  
  useEffect(() => {
    if (socketInstance?.messageHandlers) {
      socketInstance.messageHandlers.updateInterval(interval);
    }
  }, [interval, socketInstance]);
  
  // Subscribe/unsubscribe to WebSocket topics when symbol/interval changes
  useEffect(() => {
    if (!socketInstance) return;

    socketInstance.setSubscribe(symbol, interval); 

    return () => {
      socketInstance.setUnsubscribe(symbol, interval); 
    };
  }, [socketInstance, symbol, interval]); 

  // Context value to provide to children
  const contextValue = useMemo(
    () => ({
      socketInstance,
      symbol,
      exchange,
      interval,
    }),
    [socketInstance, symbol, exchange, interval],
  );

  return (
    <PriceChartContext.Provider value={contextValue}>
      {children}
    </PriceChartContext.Provider>
  );
};
export default PriceChartProvider;