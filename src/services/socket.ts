import { ISocketOptions, TArgs, TTopic } from "#/types/socket.type";

const DEFAULT_OPTIONS: ISocketOptions = {
  debug: false,
  OUTGOING_PING_MESSAGE: JSON.stringify({ type: "ping" }),
  PONG_MESSAGE_TYPE: "pong",
  PONG_MESSAGE_KEY: "type",
  PING_INTERVAL_MS: 5000,
  PONG_TIMEOUT_MS: 10000,
  RECONNECT_INTERVAL_MS: 5000,
  ENABLE_PING_PONG: true,
  SUBSCRIPTION_FORMAT: (args: TArgs) => ({ op: "subscribe", args: [args] }),
  UNSUBSCRIPTION_FORMAT: (args: TArgs) => ({ op: "unsubscribe", args: [args] }),
};

class Socket {
  private ws: WebSocket | null = null;
  private readonly url: string;
  private options: ISocketOptions;
  private messageQueue: Set<TTopic> = new Set();
  private subscriptions: Set<TTopic> = new Set();
  private shouldReconnect = false;
  private receiveCallback: ((data: any) => void) | null = null;

  constructor(url: string, options?: Partial<ISocketOptions>) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener("online", this.reconnect);
    window.addEventListener("offline", this.clearSocket);
  }

  public setReceiveCallback = (callback: (e: any) => void) => {
    this.receiveCallback = callback;
  };

  private connectedCallback = () => {
    this.subscriptions.forEach((target) => this.subscribe(target));
  };

  public connect = () => {
    this.clearSocket();
    this.initializeSocket();
  };

  public reconnect = () => {
    this.shouldReconnect = true;
    this.connect();
  };

  public disconnect = () => {
    this.clearSocket();
  };

  private send = (message: string) => {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.add(message);
    }
  };

  public subscribe = (args: TArgs) => {
    const message = JSON.stringify(this.options.SUBSCRIPTION_FORMAT(args));
    this.send(message);
    this.subscriptions.add(args);
  };

  public unsubscribe(args: TArgs) {
    const message = JSON.stringify(this.options.UNSUBSCRIPTION_FORMAT(args));
    this.send(message);
    this.subscriptions.delete(args);
  }

  private initializeSocket = () => {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => this.connectedCallback();

    this.ws.onmessage = (e: MessageEvent) => {
      const parsedMessage = JSON.parse(e.data);
      if (this.receiveCallback) this.receiveCallback(parsedMessage);
    };

    this.ws.onclose = (e) => {
      console.warn(`WS > close > `, e);
    };

    this.ws.onerror = (e) => {
      console.error(`WS > error > `, e);
    };
  };

  private clearSocket = (): void => {
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }
  };
}

export default Socket;
