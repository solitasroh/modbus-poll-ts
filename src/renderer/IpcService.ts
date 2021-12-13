import { IpcRenderer, IpcRendererEvent } from "electron";
import { Buffer } from "buffer";
export type IpcEventHandler = (event: IpcRendererEvent, args: any[]) => void;

export default class IpcService {
  private static instance: IpcService;

  static getInstance(): IpcService {
    if (this.instance == null) {
      this.instance = new IpcService();
    }
    return this.instance;
  }
  private ipcRenderer?: IpcRenderer;

  private initIpcRenderer() {
    if (!window || !window.process || !window.require) {
      throw new Error("Unable to require renderer process");
    }

    this.ipcRenderer = window.require("electron").ipcRenderer;
  }

  public connectionStateCheck(
    listener: (event: IpcRendererEvent, ...args: any[]) => void
  ): void {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }
    this.ipcRenderer.send("MB_SERVER_STATE");

    this.ipcRenderer.once("MB_SERVER_STATE_RESP", listener);
  }

  public connectServer(
    host: string,
    port: number,
    timeout: number,
    pollingInterval: number
  ): Promise<boolean> {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.send("MB_CONN_REQ", {
      host,
      port,
      timeout,
      pollingInterval,
    });

    return new Promise((resolve) => {
      this.ipcRenderer.once("MB_CONN_RESP", (event, response) => {
        resolve(response);
      });
    });
  }

  public disconnectServer(): Promise<boolean> {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.send("MB_DISCONN_REQ");

    return new Promise((resolve) => {
      this.ipcRenderer.once("MB_DISCONN_RESP", (event, response) => {
        resolve(response);
      });
    });
  }

  public readHoldingRegister(
    address: number,
    length: number,
    callback: (data: Buffer) => void
  ): void {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.removeAllListeners("MB_FC3_REQ");
    this.ipcRenderer.removeAllListeners("MB_FC3_RESP");

    this.ipcRenderer.send("MB_FC3_REQ", { address, length });
    this.ipcRenderer.on("MB_FC3_RESP", (event, response) => {
      console.log("resp FC3");
      const buffer = Buffer.from(response); // 왜 이래야하는지 모르겠음 ㅠ
      callback(buffer);
    });
  }

  public on(channel: string, eventHandler: IpcEventHandler): void {
    this.ipcRenderer.on(channel, eventHandler);
  }

  public removeListener(channel: string, eventHandler: IpcEventHandler): void {
    this.ipcRenderer.removeListener(channel, eventHandler);
  }
}
