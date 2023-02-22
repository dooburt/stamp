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
import { app, BrowserWindow, shell, ipcMain, protocol, dialog } from 'electron';
import chalk from 'chalk';
import dayjs from 'dayjs';
import fs from 'fs';

import zip from './zip';
import MenuBuilder from './menu';
import {
  getAssetsPath,
  getComputerName,
  resolveHtmlPath,
  uniqueName,
} from './util';
import encryptionPipe from './encryptor';

const Store = require('electron-store');

const VERSION = '0.0.1'; // get from package eventually
const HEIGHT = 728;
const WIDTH = 1024;
const EXTENSION = '.boo';

let mainWindow: BrowserWindow | null = null;
let localStore: any = null;
let rawKey: string = '';

ipcMain.handle('READ_PEEKABOO_CONTENTS', async () => {
  console.log(chalk.yellow(`READ_PEEKABOO_CONTENTS`));
  const vaultPath = `${app.getPath('userData')}\\vault\\`;
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);
  fs.readdir(vaultPath, function (err, files) {
    const booFiles = files.filter((el) => path.extname(el) === EXTENSION);
    return booFiles;
  });
});

ipcMain.handle('ENCRYPT_DIR', async (event, pathToData) => {
  console.log(chalk.yellow(`ENCRYPT_DIR`, event, pathToData));

  const vaultPath = `${app.getPath('userData')}\\vault\\`;
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);

  const obsfucatedName = uniqueName();
  console.log(chalk.blue(`About to encrypt directory: ${pathToData} ...`));
  console.log(chalk.blue(`Will give object name of ${obsfucatedName}`));

  const booFile = `${vaultPath}\\${obsfucatedName}.boo`;
  const exists = fs.existsSync(booFile);

  console.log(chalk.green(`And then move it to: ${booFile}`));
  console.log('ENCRYPT_DIR', 'Does file exist?', exists);
  if (exists) return false;

  const archive = await zip(pathToData, vaultPath, obsfucatedName);
  console.log(chalk.green(`Archive created successfully`, archive));

  const encryptedContent = await encryptionPipe(archive, rawKey, booFile);
  console.log(
    chalk.green(
      `Encrypted boofile created successfully`,
      encryptedContent.iv,
      encryptedContent.hash
    )
  );

  localStore = new Store({
    name: 'peekaboo',
    watch: true,
    // encryptionKey: key,
  });

  const storeContent = (await localStore.get('contents')) || [];
  storeContent.push({
    friendlyName: 'More on this later',
    secureName: obsfucatedName,
    originalLocation: pathToData,
    peekabooLocation: booFile,
    status: 'locked',
    diskSize: 12322,
    itemCount: 1,
  });

  localStore.set('contents', storeContent);

  return true;
});

ipcMain.handle('SELECT_DIR', async () => {
  console.log(chalk.yellow(`SELECT_DIR`));
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  console.log('directories selected', result.filePaths);
  return result;
});

ipcMain.handle('SNIFF_STORE', async () => {
  console.log(chalk.yellow(`SNIFF_STORE`));
  const storePath = `${app.getPath('userData')}\\peekaboo.json`;
  const exists = fs.existsSync(storePath);
  console.log('SNIFF_STORE', exists);
  // event.reply('SNIFF_STORE', exists);
  return exists;
});

ipcMain.handle('GET_USER', async () => {
  console.log(chalk.yellow(`GET_USER`));
  return localStore.get('user');
});

ipcMain.handle('CREATE_STORE', async (event, key) => {
  console.log(chalk.yellow(`CREATE_STORE`));
  // todo: this all needs heavily encrypting

  localStore = new Store({
    name: 'peekaboo',
    watch: true,
    // encryptionKey: key,
  });

  rawKey = key;
  const deviceName = getComputerName() || 'ὓṇḵṅṏẁṉ';
  localStore.set('peekabooKey', {
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
    name: 'peekaboo',
    watch: true,
    // encryptionKey: key,
  });

  const stored = localStore.get('peekabooKey').key;
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
    maxWidth: 3840,
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
