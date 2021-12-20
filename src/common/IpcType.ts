import { IpcMainEvent, IpcRendererEvent } from "electron";

export type IpcEventHandler = (event: IpcRendererEvent, ...args: any[]) => void;
export type IpcMainEventHandler = (event: IpcMainEvent, ...args: any[]) => void;

export interface IpcMainEventArgs {
  event: IpcMainEvent;
  args: any[];
}

export interface ModbusRequestArgs {
  address: number;
  length: number;
}
