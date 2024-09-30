export interface ISocketOptions {
  debug: boolean;
  OUTGOING_PING_MESSAGE: string;
  PONG_MESSAGE_TYPE: string;
  PONG_MESSAGE_KEY: string;
  PING_INTERVAL_MS: number;
  PONG_TIMEOUT_MS: number;
  RECONNECT_INTERVAL_MS: number;
  ENABLE_PING_PONG: boolean;
  SUBSCRIPTION_FORMAT(args: TArgs): any;
  UNSUBSCRIPTION_FORMAT(args: TArgs): any;
}

export type TArgs = any;

export type TTopic = string;
