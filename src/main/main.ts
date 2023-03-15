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
import { randomUUID } from 'crypto';
import { PeekabooItem } from 'renderer/constants/app';
import zip from './zip';
import MenuBuilder from './menu';
import availableColors from '../constants/colors';
import {
  delay,
  getAssetsPath,
  getComputerName,
  resolveHtmlPath,
  shuffle,
  uniqueName,
} from './util';
import encryptionPipe from './encryptor';
import decryptionPipe from './decryptor';

const Store = require('electron-store');

const VERSION = '0.0.1'; // get from package eventually
const HEIGHT = 728;
const WIDTH = 1024;
// const EXTENSION = '.boo';

let mainWindow: BrowserWindow | null = null;
let localStore: any = null;
let rawKey: string = '';

ipcMain.handle('READ_PEEKABOO_CONTENTS', async () => {
  console.log(chalk.yellow(`READ_PEEKABOO_CONTENTS`));

  localStore = new Store({
    name: 'peekaboo',
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

ipcMain.handle('DECRYPT', async (event, idToDecrypt) => {
  console.log(chalk.yellow(`DECRYPT`, event, idToDecrypt));

  localStore = new Store({
    name: 'peekaboo',
    watch: true,
    // encryptionKey: key,
  });

  const vaultPath = `${app.getPath('userData')}\\vault\\`;
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);

  const storeContent = (await localStore.get('contents')) || [];
  const found = storeContent.find(
    (item: PeekabooItem) => item.id === idToDecrypt
  );
  if (!found) {
    console.log(chalk.red(`DECRYPT`, `Can't find that item in store`));
    return null;
  }

  const decryptedZip = `${vaultPath}\\${found.secureName}.boo`;

  const originalLocation = Buffer.from(
    found.originalLocation,
    'base64'
  ).toString('ascii');
  const peekabooLocation = Buffer.from(
    found.peekabooLocation,
    'base64'
  ).toString('ascii');

  console.log(
    chalk.cyan(
      'found',
      JSON.stringify(found),
      originalLocation,
      peekabooLocation
    )
  );

  const decryptedContent = await decryptionPipe(
    peekabooLocation,
    rawKey,
    found.iv,
    decryptedZip
  );
  console.log(
    chalk.green(
      `Decrypyted boofile created successfully`,
      JSON.stringify(decryptedContent)
    )
  );

  return null;
});

ipcMain.handle('ENCRYPT_DIR', async (event, pathToData) => {
  console.log(chalk.yellow(`ENCRYPT_DIR`, event, pathToData));

  const vaultPath = `${app.getPath('userData')}\\vault\\`;
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);

  // const size = await dirSize(pathToData);
  const obsfucatedName = uniqueName();
  console.log(chalk.blue(`About to encrypt directory: ${pathToData} ...`));
  console.log(chalk.blue(`Will give object name of ${obsfucatedName}`));

  let itemCount = 1;
  fs.readdir(pathToData, (err, files) => {
    itemCount = files.length;
  });
  fs.statSync(pathToData);

  const booFile = `${vaultPath}\\${obsfucatedName}.boo`;
  const exists = fs.existsSync(booFile);

  console.log(chalk.green(`And then move it to: ${booFile}`));
  console.log('ENCRYPT_DIR', 'Does file exist?', exists);
  if (exists) return false;

  const { archive, size } = await zip(pathToData, vaultPath, obsfucatedName);
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
    id: randomUUID(),
    iv: encryptedContent.iv,
    color: shuffle(availableColors)[2],
    friendlyName: obsfucatedName,
    secureName: obsfucatedName,
    originalLocation: Buffer.from(pathToData).toString('base64'),
    peekabooLocation: Buffer.from(booFile).toString('base64'),
    status: 'locked',
    diskSize: size,
    itemCount: itemCount,
    created: dayjs().toDate(),
    modified: dayjs().toDate(),
  });

  console.log(
    chalk.green(`Successfully encrypted: ${booFile} and set into local store`)
  );

  localStore.set('contents', storeContent);

  await delay(1000);

  fs.unlinkSync(archive);
  fs.rmSync(pathToData, { recursive: true, force: true });

  console.log(chalk.green(`Removed archive: ${archive}`));

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
