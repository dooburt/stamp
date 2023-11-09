/* eslint-disable import/order */
/* eslint-disable prefer-destructuring */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

// https://texts.com/blog/simplifying-ipc-in-electron
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import chalk from 'chalk';
import dayjs from 'dayjs';
import fs from 'fs';
import Store from 'electron-store';
import { Deeplink } from 'electron-deeplink';
import MenuBuilder from './menu';
import { getAssetsPath, getComputerName, resolveHtmlPath } from './util';
import InitiatePayload from 'types/initiatePayload';

const VERSION = '0.0.1'; // get from package eventually
const HEIGHT = 728;
const WIDTH = 1024;
// const EXTENSION = '.boo';

let mainWindow: BrowserWindow | null = null;
let localStore: any = null;
let rawKey: string = '';

ipcMain.handle('READ_STAMP_CONTENTS', async () => {
  console.log(chalk.yellow(`READ_STAMP_CONTENTS`));

  localStore = new Store({
    name: 'stamp',
    watch: true,
    // encryptionKey: key,
  });

  const encodedData = localStore.get('contents');
  const decodedData: any[] = [];

  encodedData.forEach((boo: any) => {
    const b = {
      id: boo.id,
      color: boo.color,
      friendlyName: boo.friendlyName,
      secureName: boo.secureName,
      status: boo.status,
      diskSize: boo.diskSize,
      itemCount: boo.itemCount,
      originalLocation: Buffer.from(boo.originalLocation, 'base64').toString(
        'ascii'
      ),
      peekabooLocation: Buffer.from(boo.peekabooLocation, 'base64').toString(
        'ascii'
      ),
      created: boo.created,
      modified: boo.modified,
    };
    decodedData.push(b);
  });

  // console.log('decodedData', decodedData);
  return decodedData;

  // const vaultPath = `${app.getPath('userData')}\\vault\\`;
  // if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);
  // const files = getFilesInDirectory(vaultPath).filter(
  //   (file) => path.extname(file) === EXTENSION
  // );
  // console.log('files', files);
  // return files;
});

ipcMain.handle('UNLINK', async (event, idToUnlink) => {
  console.log(chalk.yellow(`UNLINK`, event, idToUnlink));

  // remove from contents in store where id matches
  // rewrite contents
  // decrypt item and unpack in original location
});

ipcMain.handle('SNIFF_STORE', async () => {
  console.log(chalk.yellow(`SNIFF_STORE`));
  const storePath = `${app.getPath('userData')}\\stamp.json`;
  const exists = fs.existsSync(storePath);
  console.log('SNIFF_STORE', exists);
  // event.reply('SNIFF_STORE', exists);
  return exists;
});

ipcMain.handle('INITIATE_USER', async (event, payload: InitiatePayload) => {
  console.log(chalk.yellow(`INITIATE_USER`));

  const deviceName = getComputerName() || 'ὓṇḵṅṏẁṉ';

  localStore = new Store({
    name: 'stamp',
    watch: true,
    // encryptionKey: key,
  });
  localStore.set('device', {
    name: deviceName,
  });
  localStore.set('user', {
    ...payload,
  });

  console.log('INITIATE_USER', 'Success');
  return true;
});

ipcMain.handle('GET_USER', async () => {
  console.log(chalk.yellow(`GET_USER`));
  return localStore.get('user');
});

ipcMain.handle('CREATE_STORE', async (event, key) => {
  console.log(chalk.yellow(`CREATE_STORE`));
  // todo: this all needs heavily encrypting

  localStore = new Store({
    name: 'stamp',
    watch: true,
    // encryptionKey: key,
  });

  rawKey = key;
  const deviceName = getComputerName() || 'ὓṇḵṅṏẁṉ';
  localStore.set('stampKey', {
    key: key,
    date: dayjs().toISOString(),
  });
  localStore.set('user', {
    name: deviceName,
    email: '',
  });
  console.log('CREATE_STORE', deviceName);
  return true;
});

ipcMain.handle('AUTHENTICATE', async (event, key) => {
  console.log(chalk.yellow(`AUTHENTICATE`));

  localStore = new Store({
    name: 'stamp',
    watch: true,
    // encryptionKey: key,
  });

  const stored = localStore.get('stampKey').key;
  console.log(chalk.yellow(`key`, key));
  console.log(chalk.yellow(`stored`, stored));
  // todo: encrypt given key here and compare with stored.
  // todo: store the true key in memory, otherwise we cannot encrypt things

  if (stored === key) {
    rawKey = key;
    return true;
  }
  return false;
});

ipcMain.on('GET_STORE_VALUE', async (event, key) => {
  const data = localStore.get(key);
  console.log('GET_STORE_VALUE', data);
  event.reply('GET_STORE_VALUE', data);
});

ipcMain.on('SET_STORE_VALUE', async (event, key, data) => {
  if (!key) event.reply('SET_STORE_VALUE', null);
  localStore.set(key, data);
  console.log('SET_STORE_VALUE', data);
  event.reply('SET_STORE_VALUE', data);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
const isDev = process.env.NODE_ENV === 'development';

if (isDebug) {
  require('electron-debug')({ devToolsMode: 'detach' });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: WIDTH,
    minWidth: WIDTH,
    maxWidth: WIDTH,
    minHeight: HEIGHT,
    maxHeight: HEIGHT,
    height: HEIGHT,
    icon: getAssetPath('icon.png'),
    frame: false,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#fff',
      symbolColor: '#1E293B',
      height: 31,
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  /**
  It is a tad more involved (but useful for any other providers too). I am assuming you have used some kind of OAuth provider before.

  Register a custom url handler in your Electron app (e.g. myapp://. You can do this with the protocol). We used the electron-deeplink library

  On your app's website, setup a side page that can launch your app. For example, we have an authorize page that launches our app. You want to register this website as the redirect url from Google, so when Google hits this url, it passes the validate tokens to it. You can do any OAuth Work here.

  Finally, from your website, call your app's url handler. myapp://authroize?code=XYZ. This sends all the data back to your main App.

  https://arunpasupathi.medium.com/how-to-implement-google-authentication-in-your-electron-app-aec168af7410
  */

  const prot = isDev ? 'dev-stamp-app' : 'stamp-app';
  const deeplink = new Deeplink({ app, mainWindow, protocol: prot, isDev });

  deeplink.on('received', (link) => {
    console.log('deeplink received', link);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  //new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  console.log(chalk.blue(`Peekaboo v${VERSION} started.`));
  console.log(chalk.green(`App path: ${app.getPath('userData')}`));
  console.log(
    chalk.yellow(`Storage path: ${app.getPath('userData')}\\stamp.json`)
  );
  console.log(chalk.green(`Asset path: ${getAssetsPath()}`));

  protocol.registerFileProtocol('atom', (request, callback) => {
    const url = request.url.replace(`atom://`, '');
    try {
      console.log('atom callback', url);
      return callback(url);
    } catch (error) {
      console.error(error);
      return callback('404');
    }
  });

  createWindow();
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow();
  });
});
