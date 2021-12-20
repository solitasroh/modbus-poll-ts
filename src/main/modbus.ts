import { ipcMain, IpcMainEvent, WebContents } from "electron";
import { ModbusTCPClient } from "jsmodbus";
import { Socket } from "net";

import {
  FC3_POLL_RESP,
  FC3_REQ,
  MB_CONNECT,
  MB_DISCONNECT,
  MB_IS_CONNECTED,
  MB_SERVER_STATE,
} from "@src/IpcMessageDefine";
import { ModbusRequestArgs } from "@src/common/IpcType";

export type onConnectCallback = (result: boolean) => void;

export interface ModbusConnectOpts {
  host: string;
  port: number;
  timeout: number;
  pollingInterval: number;
}

export class ModbusService {
  client: ModbusTCPClient;
  socket: Socket;

  private static instance: ModbusService;
  private interval = 1000;
  private timeout = 1000;
  private intervalTimer: NodeJS.Timer;
  private webContents: WebContents;

  static getInstance(): ModbusService {
    if (this.instance == null) {
      this.instance = new ModbusService();
    }
    return this.instance;
  }

  static setContents(contents: WebContents): void {
    if (this.instance != null) this.instance.webContents = contents;
  }

  constructor() {
    this.socket = new Socket();
    this.client = new ModbusTCPClient(this.socket);

    this.socket.on("connect", () => {
      console.log("mb> connect to server");
      this.notifyConnectionState();
    });

    this.socket.on("error", (err: Error) => {
      console.log("mb> error connecting server", err);
      this.notifyConnectionState();
    });

    this.socket.on("close", () => {
      /// TODO: notify server state to render process
      console.log("mb> server closed");
      this.notifyConnectionState();
    });

    ipcMain.on(MB_CONNECT, this.connectToServer);

    ipcMain.on(MB_DISCONNECT, this.disconnectToServer);

    ipcMain.on(FC3_REQ, this.pollRegisters);

    ipcMain.on(MB_IS_CONNECTED, () => {
      this.notifyConnectionState();
    });
  }

  private connectToServer = (event: IpcMainEvent, args: ModbusConnectOpts) => {
    const { host, port, timeout, pollingInterval }: ModbusConnectOpts = args;

    console.log(
      `connect: ${host}:${port} (interval:${pollingInterval}, timeout: ${timeout})`
    );

    this.timeout = timeout;
    this.interval = pollingInterval;

    if (this.interval < 1000) {
      this.interval = 3000;
    }

    this.socket.connect({ host, port });
  };

  private disconnectToServer = (event: IpcMainEvent) => {
    try {
      if (this.socket === null) return;

      this.socket.end(() => {
        this.notifyConnectionState();
      });

      this.socket.destroy();
    } catch (error) {
      // do nothing
      // this.notifyConnectionState();
      console.log(`socket close error`, error);
    }
  };

  private pollRegisters = (
    event: IpcMainEvent,
    { address, length }: ModbusRequestArgs
  ) => {
    console.log("FC3 address: ", address);

    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
    }

    this.intervalTimer = setInterval(async () => {
      try {
        const result = await this.client.readHoldingRegisters(address, length);

        if (this.webContents != null) {
          this.webContents.send(
            FC3_POLL_RESP,
            result.response.body.valuesAsBuffer
          );
        }
      } catch (error) {
        console.log("read register error: ", error);
        clearInterval(this.intervalTimer);
      }
    }, this.interval);
  };

  private notifyConnectionState = () => {
    if (this.webContents !== null) {
      try {
        this.webContents.send(MB_SERVER_STATE, this.client.connectionState);
      } catch (error) {
        console.log("mb> notify connect state error", error);
      }
    }
  };
}
