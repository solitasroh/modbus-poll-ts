import { IpcRenderer, IpcRendererEvent } from "electron";
import { Buffer } from "buffer";
import {
  FC3_REQ,
  MB_CONNECT,
  MB_DISCONNECT,
  MB_IS_CONNECTED,
  MB_SERVER_STATE,
} from "@src/IpcMessageDefine";
export type IpcEventHandler = (event: IpcRendererEvent, ...args: any[]) => void;

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
    this.ipcRenderer.on(MB_SERVER_STATE, listener);
    this.ipcRenderer.send(MB_IS_CONNECTED);
  }

  public connectServer(
    host: string,
    port: number,
    timeout: number,
    pollingInterval: number
  ): void {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.send(MB_CONNECT, {
      host,
      port,
      timeout,
      pollingInterval,
    });
  }

  public disconnectServer(): Promise<boolean> {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.send(MB_DISCONNECT);

    return new Promise((resolve) => {
      this.ipcRenderer.once("MB_DISCONN_RESP", (event, response) => {
        resolve(response);
      });
    });
  }

  public readHoldingRegister(
    address: number,
    length: number,
    scanRate: number
  ): void {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    this.ipcRenderer.send(FC3_REQ, { address, length, scanRate });
  }

  public on(channel: string, eventHandler: IpcEventHandler): void {
    if (!this.ipcRenderer) {
      this.initIpcRenderer();
    }

    try {
      this.ipcRenderer.on(channel, eventHandler);
    } catch (error) {
      // nothing to do
    }
  }

  public removeListener(channel: string, eventHandler: IpcEventHandler): void {
    this.ipcRenderer.removeListener(channel, eventHandler);
  }
}
