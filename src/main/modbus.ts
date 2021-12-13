import { ipcMain } from "electron";
import { ModbusTCPClient } from "jsmodbus";
import { Socket, SocketConnectOpts } from "net";

export type onConnectCallback = (result: boolean) => void;

export interface ModbusConnectOpts {
  host: string;
  port: number;
  timeout: number;
  pollingInterval: number;
}

export class ModbusService {
  client: ModbusTCPClient;
  socket: Socket = new Socket();
  private static instance: ModbusService;
  private interval = 1000;
  private intervalTimer: NodeJS.Timer;

  static getInstance(): ModbusService {
    if (this.instance == null) {
      this.instance = new ModbusService();
    }
    return this.instance;
  }

  constructor() {
    this.client = new ModbusTCPClient(this.socket);

    ipcMain.on("MB_CONN_REQ", (event, args) => {
      const { host, port, timeout, pollingInterval }: ModbusConnectOpts = args;

      this.interval = pollingInterval;
      console.log(this.interval);
      if (this.interval < 1000) {
        this.interval = 3000;
      }

      this.connect(host, port, (connected) => {
        event.sender.send("MB_CONN_RESP", connected);
      });
    });

    ipcMain.on("MB_DISCONN_REQ", (event, args) => {
      this.socket.on("close", () => {
        event.sender.send("MB_DISCOON_RESP", true);
      });
      this.disconnect();
    });

    ipcMain.on("MB_FC3_REQ", async (event, args) => {
      const { address, length } = args;
      console.log("request FC3 ", address);

      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
      }

      this.intervalTimer = setInterval(async () => {
        try {
          const result = await this.client.readHoldingRegisters(
            address,
            length
          );
          event.sender.send("MB_FC3_RESP", result.response.body.valuesAsArray);
        } catch (error) {
          console.log(error);
        }
      }, this.interval);
    });

    ipcMain.on("MB_SERVER_STATE", (event, args) => {
      if (this.client) {
        event.sender.send("MB_SERVER_STATE_RESP", this.client.connectionState);
      } else {
        event.sender.send("MB_SERVER_STATE_RESP", "offline");
      }
    });
  }

  connect(
    host: string,
    port = 502,
    onConnect?: onConnectCallback,
    retryConnect?: boolean
  ): void {
    const options: SocketConnectOpts = {
      host,
      port,
    };

    this.socket.setTimeout(1000, () => {
      console.log("timeout!!!");
    });

    this.socket.on("connect", () => {
      console.log("mb> connect to server");
      onConnect(true);
    });

    this.socket.on("timeout", () => {
      console.log("mb> timeout server");
      onConnect(false);
    });

    this.socket.on("error", (err: Error) => {
      console.log("mb> error connecting server", err);
      onConnect(false);
    });

    this.socket.connect(options);
  }

  disconnect(): void {
    this.socket.end(() => {
      console.log("socket end");
    });

    this.socket.destroy();
    this.socket.removeAllListeners();
  }

  async pollRequest(address: number, length: number) {
    return await this.client.readHoldingRegisters(address, length);
  }
}
