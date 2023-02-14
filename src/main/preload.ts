/* eslint-disable no-console */
// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  sniffStore: async () => {
    try {
      return await ipcRenderer.invoke('SNIFF_STORE');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  createStore: async (key: string) => {
    try {
      return await ipcRenderer.invoke('CREATE_STORE', key);
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  setStoreValue: (key: string, data: any) =>
    ipcRenderer.send('SET_STORE_VALUE', key, data),
  getStoreValue: async (key: string) => {
    const data = await ipcRenderer.invoke('GET_STORE_VALUE', key);
    console.log('ipc getStoreValue', data);
    return data;
  },
});

/**
 *   selectFile: () => ipcRenderer.invoke('dialog:openFile'),
  ping: (msg: string) => ipcRenderer.send('ping', msg),
  pong: (msg: string) => {
    console.log('ping');
    ipcRenderer.send('pong', msg);
  },
  readPeekabooFile: () => ipcRenderer.send('get-peekaboo-file'),
  checkStorage: () => ipcRenderer.send('check-storage'),
  createStorage: (key: string) => ipcRenderer.send('create-storage', key),
 */

// export type Channels = 'peekaboo' | 'get-peekaboo-file';

// const electronHandler = {
//   ipcRenderer: {
//     sendMessage(channel: Channels, args: unknown[]) {
//       ipcRenderer.send(channel, args);
//     },
//     on(channel: Channels, func: (...args: unknown[]) => void) {
//       const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
//         func(...args);
//       ipcRenderer.on(channel, subscription);

//       return () => {
//         ipcRenderer.removeListener(channel, subscription);
//       };
//     },
//     once(channel: Channels, func: (...args: unknown[]) => void) {
//       ipcRenderer.once(channel, (_event, ...args) => func(...args));
//     },
//   },
// };

// contextBridge.exposeInMainWorld('electron', electronHandler);

// export type ElectronHandler = typeof electronHandler;

// export contextBridge
