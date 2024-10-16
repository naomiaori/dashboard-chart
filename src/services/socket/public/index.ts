import { QueryClient } from "@tanstack/react-query";
import { TSymbol, TBase } from "#/types/price-chart.type";
import Socket from "../../socket";
import PublicMessageHandler from "./handler";
import { TExchange } from "#/types/exchange.type";

type SocketConstructorParams = ConstructorParameters<typeof Socket>;

class PublicSocket extends Socket {
  public readonly exchange: TExchange;

  public messageHandlers: PublicMessageHandler;

  constructor(
    url: SocketConstructorParams[0],
    options: SocketConstructorParams[1],
    symbol: TSymbol,
    exchange: TExchange,
    interval: string,
    queryClient: QueryClient,
  ) {
    super(url, options);
    this.exchange = exchange;
    this.messageHandlers = new PublicMessageHandler(
      this,
      symbol,
      queryClient,
      interval,
      exchange
    );

    this.connect();
  }

  private getArgs(symbol: TSymbol, interval: string): string[] {
    switch (this.exchange) {
      case "BYBIT":
        return [`kline.${interval}.${symbol}`]; // Example for Bybit
      case "BINANCE":
        return [`${symbol.toLowerCase()}@kline_${interval}`]; // Example for Binance
      default:
        throw new Error(`Unsupported exchange: ${this.exchange}`);
    }
  }
  public setSubscribe(symbol: TSymbol, interval: string) {
    const args = this.getArgs(symbol, interval);
    args.forEach((arg) => this.subscribe(arg));
  }

  // Unsubscribe from kline topics
  public setUnsubscribe(symbol: TSymbol, interval: string) {
    const args = this.getArgs(symbol, interval);
    args.forEach((arg) => this.unsubscribe(arg));
  }
}

export default PublicSocket;
