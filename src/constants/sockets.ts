import { ISocketOptions, TArgs } from "#/types/socket.type";
import { TExchange } from "#/types/exchange.type";

export const SOCKET_URL_MAP: Record<TExchange, string> = {
  BYBIT: "wss://stream.bybit.com/v5/public/spot",
  // OKX: 'wss://ws.okx.com:8443/ws/v5/public',
  BINANCE: "wss://stream.binance.com:9443/ws",
  // BITGET: 'wss://ws.bitget.com/v2/ws/public',
  // BITHUMB: 'wss://pubwss.bithumb.com/pub/ws',
};

export const SOCKET_OPTIONS: Record<TExchange, Partial<ISocketOptions>> = {
  BYBIT: {
    ENABLE_PING_PONG: false,
  },
  BINANCE: {
    ENABLE_PING_PONG: false,
    SUBSCRIPTION_FORMAT: (args: TArgs) => ({
      method: "SUBSCRIBE",
      params: [args],
      id: 1,
    }),
    UNSUBSCRIPTION_FORMAT: (args: TArgs) => ({
      method: "UNSUBSCRIBE",
      params: [args],
      id: 1,
    }),
  },
  // BITGET: {
  // 	ENABLE_PING_PONG: false,
  // },
  // BITHUMB: {
  // 	ENABLE_PING_PONG: false,
  // 	SUBSCRIPTION_FORMAT: (args: TArgs) => args,
  // 	UNSUBSCRIPTION_FORMAT: (args: TArgs) => args,
  // },
};
