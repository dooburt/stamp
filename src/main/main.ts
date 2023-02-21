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
import MenuBuilder from './menu';
import { getAssetsPath, resolveHtmlPath } from './util';

const Store = require('electron-store');

const VERSION = '0.0.1'; // get from package eventually
const HEIGHT = 728;
const WIDTH = 1024;

let mainWindow: BrowserWindow | null = null;
// let localStore: any;

const localStore = new Store({
  name: 'peekaboo',
  watch: true,
  // encryptionKey: key,
});

ipcMain.handle('SNIFF_STORE', async () => {
  const storePath = `${app.getPath('userData')}\\peekaboo.json`;
  const exists = fs.existsSync(storePath);
  console.log('SNIFF_STORE', exists);
  // event.reply('SNIFF_STORE', exists);
  return exists;
});

ipcMain.on('CREATE_STORE', async (event, key) => {
  // todo: this all needs heavily encrypting
  localStore.set('peekabooKey', {
    key: key,
    date: dayjs().toISOString(),
  });
  console.log('CREATE_STORE');
});

ipcMain.handle('AUTHENTICATE', async (event, key) => {
  const stored = localStore.get('peekabooKey').key;
  // todo: encrypt given key here and compare with stored.
  if (stored === key) {
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
      color: '#1E293B',
      symbolColor: '#fff',
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
    chalk.yellow(`Storage path: ${app.getPath('userData')}\\peekaboo.json`)
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
