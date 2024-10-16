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

  private pingPongTimer?: NodeJS.Timeout;

  private disconnectTimer?: NodeJS.Timeout;

  private reconnectTimer?: NodeJS.Timeout;

  constructor(url: string, options?: Partial<ISocketOptions>) {
    this.url = url;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    this.setupEventListeners();
  }

  private setupEventListeners() {
    const visibilityOrFocusHandler = () => {
      if (
        document.visibilityState === "visible" &&
        this.ws?.readyState === WebSocket.CLOSED
      ) {
        this.debug("Reconnect on visibility or focus event");
        this.reconnect();
      }
    };

    window.addEventListener("visibilitychange", visibilityOrFocusHandler);
    window.addEventListener("focus", visibilityOrFocusHandler);
    window.addEventListener("online", () => {
      this.debug("Network connected. Reconnecting WebSocket...");
      this.reconnect();
    });
    window.addEventListener("offline", () => {
      this.debug("Network disconnected. Clearing WebSocket...");
      this.clearSocket();
    });
  }

  private debug(...args: any[]) {
    if (this.options.debug) {
      console.log("WS >", ...args);
    }
  }

  /**
   * @description Sets the callback function to be invoked when a message is received on the WebSocket connection.
   * @param callback - Function to handle incoming messages.
   */
  
  public setReceiveCallback = (callback: (e: any) => void) => {
    this.receiveCallback = (data: any) => {
      callback(data);
    };
  };

  /**
   * @description Re-subscribes to args or sends queued messages when the WebSocket connection is established.
   */
  private connectedCallback = () => {
    if (this.shouldReconnect) {
      this.subscriptions.forEach((target) => this.subscribe(target));
      this.shouldReconnect = false;
    } else {
      this.messageQueue.forEach((target) => this.send(target));
      this.messageQueue.clear();
    }
  };

  /**
   * @description Handles ping/pong messages to keep the connection alive.
   * @param message - The received message object from message listener.
   */
  public pingPongCallback = (message: any) => {
    const pongMessageKey =
      this.options.PONG_MESSAGE_KEY || DEFAULT_OPTIONS.PONG_MESSAGE_KEY;

    if (message[pongMessageKey] === "pong") {
      clearTimeout(this.disconnectTimer);
      this.setDisconnectTimer();
    }
  };

  /**
   * @description Initiates the WebSocket connection.
   */
  public connect = () => {
    this.clearSocket();
    this.initializeSocket();
  };

  /**
   * @description Reconnects the WebSocket connection.
   */
  public reconnect = () => {
    this.shouldReconnect = true;
    this.connect();
  };

  /**
   * @description Closes the WebSocket connection and clears associated resources.
   */
  public disconnect = () => {
    this.clearSocket();
  };

  /**
   * @description Sends a message through the WebSocket connection. Queues the message if the connection is not open.
   * @param message - The message to send.
   */
  private send = (message: string) => {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.debug("WebSocket is not open.");
      this.messageQueue.add(message);
    }
  };

  /**
   * @description Subscribes to a specific topic by sending a formatted subscribe message.
   * @param args - The topic to subscribe to.
   */
  public subscribe = (args: TArgs) => {
    const message = JSON.stringify(this.options.SUBSCRIPTION_FORMAT(args));

    this.send(message);
    this.subscriptions.add(args);
    this.debug(`Subscribed to ${JSON.stringify(args)}`);
  };

  /**
   * @description Unsubscribes from a specific topic by sending a formatted unsubscribe message.
   * @param args - The topic to unsubscribe from.
   */

  public unsubscribe(args: TArgs) {
    const message = JSON.stringify(this.options.UNSUBSCRIPTION_FORMAT(args));
    this.send(message);

    const toDelete = Array.from(this.subscriptions).find((sub) =>
      this.isArgsEqual(sub, args),
    );
    if (toDelete) {
      this.subscriptions.delete(toDelete);
    }

    this.debug(`Unsubscribed from ${JSON.stringify(args)}`);
  }

  private isArgsEqual(args1: TArgs, args2: TArgs): boolean {
    return JSON.stringify(args1) === JSON.stringify(args2);
  }

  /**
   * @description Initializes the WebSocket connection and sets up event listeners for open, message, close, and error events.
   *              Also sets up the ping/pong mechanism and reconnect logic.
   */
  private initializeSocket = () => {
    this.debug("Initializing socket");
    if (!this.url || !this.receiveCallback) return;
    this.ws = new WebSocket(this.url);
    this.ws.binaryType = "arraybuffer";

    this.ws.onopen = () => {
      this.debug(this.shouldReconnect ? "Reconnect Socket" : "Open Socket");
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.setPingPongTimer();
        this.setReconnectTimer();
        this.connectedCallback();
      } else if (
        this.ws?.readyState === WebSocket.CLOSED ||
        this.ws?.readyState === WebSocket.CLOSING
      ) {
        this.ws = null;
      }
    };

    this.ws.onmessage = (e: MessageEvent) => {
      let parsedMessage;

      if (e.data instanceof ArrayBuffer) {
        const data = new TextDecoder().decode(e.data);
        parsedMessage = JSON.parse(data);
      } else {
        parsedMessage = JSON.parse(e.data);
      }

      if (this.receiveCallback) this.receiveCallback(parsedMessage);
      if (this.options.ENABLE_PING_PONG) this.pingPongCallback(parsedMessage);
    };

    this.ws.onclose = (e) => {
      console.warn(`WS > close > `, e);
    };

    this.ws.onerror = (e) => {
      console.error(`WS > error > `, e);
    };
  };

  /**
   * @description Clears the WebSocket connection and associated resources.
   *              Unsubscribes from all event listeners and clears all active timers.
   */
  private clearSocket = (): void => {
    if (!this.ws) return;
    this.ws.onopen = null;
    this.ws.onmessage = null;
    this.ws.onclose = null;
    this.ws.onerror = null;
    this.ws.close();
    this.ws = null;
    this.clearTimers();
  };

  /**
   * @description Sets up a timer to send ping messages at regular intervals to keep the connection alive.
   */
  private setPingPongTimer() {
    if (!this.options.ENABLE_PING_PONG || this.pingPongTimer) return;
    this.pingPongTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          this.options.OUTGOING_PING_MESSAGE ||
            DEFAULT_OPTIONS.OUTGOING_PING_MESSAGE,
        );
      }
    }, this.options.PING_INTERVAL_MS || DEFAULT_OPTIONS.PING_INTERVAL_MS);
    this.setDisconnectTimer();
  }

  /**
   * @description Sets up a timer to attempt reconnection if the WebSocket connection is closed or closing.
   */
  private setReconnectTimer = () => {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setInterval(() => {
      if (
        !this.ws ||
        this.ws.readyState === WebSocket.CLOSED ||
        this.ws.readyState === WebSocket.CLOSING
      ) {
        this.reconnect();
      }
    }, this.options.RECONNECT_INTERVAL_MS || DEFAULT_OPTIONS.RECONNECT_INTERVAL_MS);
  };

  /**
   * @description Sets up a timer to clear the WebSocket connection if a pong message is not received within the expected timeout.
   */
  private setDisconnectTimer = () => {
    if (this.disconnectTimer) return;

    this.disconnectTimer = setTimeout(() => {
      this.reconnect();
    }, this.options.PONG_TIMEOUT_MS || DEFAULT_OPTIONS.PONG_TIMEOUT_MS);
  };

  /**
   * @description Clears all active timers (ping/pong, disconnect, and reconnect).
   */
  private clearTimers() {
    if (this.pingPongTimer) clearInterval(this.pingPongTimer);
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
    if (this.reconnectTimer) clearInterval(this.reconnectTimer);
  }
}

export default Socket;
