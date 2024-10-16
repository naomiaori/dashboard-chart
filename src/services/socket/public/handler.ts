import { QueryClient } from "@tanstack/react-query";
import PublicSocket from "#/services/socket/public";
import { TExchange } from "#/types/exchange.type";

interface UnifiedKline {
  time: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

class PublicMessageHandler {
  private readonly ws: PublicSocket;
  private readonly queryClient: QueryClient;
  private symbol: string;
  private interval: string;
  private exchange: TExchange;


  constructor(
    socket: PublicSocket,
    symbol: string,
    queryClient: QueryClient,
    interval: string,
    exhcnage: TExchange 
  ) {
    this.ws = socket;
    this.symbol = symbol;
    this.queryClient = queryClient;
    this.interval = interval;
    this.exchange = exhcnage

    this.setReceiveHandler(); // Initialize the message handler
  }


  private setReceiveHandler() {
    switch (this.ws.exchange) {
      case "BYBIT":
        this.setBybitHandler();
        break;
      case "BINANCE":
        this.setBinanceHandler();
        break;
      default:
        console.error(`Unsupported exchange: ${this.ws.exchange}`);
    }
  }

  // Convert kline message to unified format
  private handleKlineMessage(
    data: any,
    exchange: TExchange,
  ): UnifiedKline | null {
    switch (exchange) {
      case "BYBIT":
        return {
          time: Math.floor(data.start / 1000),
          open: parseFloat(data.open),
          close: parseFloat(data.close),
          high: parseFloat(data.high),
          low: parseFloat(data.low),
          volume: parseFloat(data.volume),
        };
      case "BINANCE":
        return {
          time: Math.floor(data.t / 1000), 
          open: parseFloat(data.o),
          close: parseFloat(data.c),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          volume: parseFloat(data.v),
        };
      default:
        return null;
    }
  }

  private setBybitHandler() {
    this.ws.setReceiveCallback((data: any) => {
      if (data?.topic?.startsWith("kline")) {
        const kline = data.data[0];
        const unifiedKline = this.handleKlineMessage(kline, "BYBIT");
        if (unifiedKline) {
          this.handleFormattedData(unifiedKline);
        }
      }
    });
  }

  private setBinanceHandler() {
    this.ws.setReceiveCallback((data: any) => {
      if (data?.e === "kline") {
        const kline = data.k; 
        const unifiedKline = this.handleKlineMessage(kline, "BINANCE"); // Pass kline directly
        if (unifiedKline) {
          this.handleFormattedData(unifiedKline);
        }
      }
    });
  }

  public updateInterval(newInterval: string) {
    this.interval = newInterval;
  }

  // Method to handle formatted kline data and update React Query cache
  private handleFormattedData(unifiedKline: UnifiedKline) {
    if (!unifiedKline.time || isNaN(unifiedKline.time)) {
      console.error("Invalid time value received:", unifiedKline.time);
      return; 
    }

    this.queryClient.setQueryData(
      [this.exchange, this.symbol, this.interval],
      () => unifiedKline,
    );
  }
}

export default PublicMessageHandler;
