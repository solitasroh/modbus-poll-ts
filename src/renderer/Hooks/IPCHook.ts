import { IpcRendererEvent } from "electron";
import { useEffect, useRef } from "react";
import IpcService from "../IpcService";

type callbackFunc = () => void;
type ipcEventHandler = (event: IpcRendererEvent, args: any[]) => void;

export function ussInterval(callback: callbackFunc, interval: number): void {
  const saveCallback = useRef<callbackFunc>();
  useEffect(() => {
    saveCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      saveCallback.current();
    }
    if (interval !== null) {
      const id = setInterval(tick, interval);
      return () => clearInterval(id);
    }
    return () => clearInterval(0);
  }, [interval]);
}

export function useIpcOn(respCh: string, callback: ipcEventHandler): void {
  const saveHandler = useRef<ipcEventHandler>();
  useEffect(() => {
    saveHandler.current = callback;
  }, [callback]);

  useEffect(() => {
    const instance = IpcService.getInstance();

    const eventHandler = (evt: IpcRendererEvent, args: any[]) => {
      saveHandler.current(evt, args);
    };

    instance.on(respCh, eventHandler);

    return () => instance.removeListener(respCh, eventHandler);
  }, [respCh]);
}
