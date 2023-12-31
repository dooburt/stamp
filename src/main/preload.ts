/* eslint-disable no-console */
// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import InitiatePayload from 'types/initiatePayload';

contextBridge.exposeInMainWorld('electron', {
  initiateUser: async (payload: InitiatePayload) => {
    try {
      console.log('context initiateUser', payload);
      return await ipcRenderer.invoke('INITIATE_USER', payload);
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  getConsole: async () => {
    try {
      return await ipcRenderer.invoke('GET_CONSOLE');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  readPeekabooContents: async () => {
    try {
      return await ipcRenderer.invoke('READ_PEEKABOO_CONTENTS');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  sniffStore: async () => {
    try {
      return await ipcRenderer.invoke('SNIFF_STORE');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  getUser: async () => {
    try {
      return await ipcRenderer.invoke('GET_USER');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  selectDir: async () => {
    try {
      return await ipcRenderer.invoke('SELECT_DIR');
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  decrypt: async (idToDecrypt: string) => {
    try {
      return await ipcRenderer.invoke('DECRYPT', idToDecrypt);
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  encryptDir: async (pathToData: string) => {
    try {
      return await ipcRenderer.invoke('ENCRYPT_DIR', pathToData);
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
  authenticate: async (key: string) => {
    console.log('contextBridge AUTHENTICATE');
    try {
      return await ipcRenderer.invoke('AUTHENTICATE', key);
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
