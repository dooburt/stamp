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
import { app, BrowserWindow, shell, ipcMain, protocol, dialog } from 'electron';
import chalk from 'chalk';
import dayjs from 'dayjs';
import { lstat } from 'node:fs/promises';
import fs from 'fs';
import Store from 'electron-store';
import { randomUUID } from 'crypto';
import { PeekabooItem } from 'renderer/constants/app';
import { createZip, packTarget, unpackZip } from './zip';
import MenuBuilder from './menu';
import availableColors from '../constants/colors';
import {
  checkExists,
  checkIfDirectory,
  delay,
  getAssetsPath,
  getComputerName,
  resolveHtmlPath,
  shuffle,
  uniqueName,
} from './util';
import { createMetaData, encrypt, finaliseEncryption } from './encryptor';
import {
  decrypt,
  finaliseDecryption,
  verifyMetadataAndChecksum,
} from './decryptor';

const VERSION = '0.0.1'; // get from package eventually
const HEIGHT = 728;
const WIDTH = 1024;
// const EXTENSION = '.boo';

let mainWindow: BrowserWindow | null = null;
let localStore: any = null;
let rawKey: string = '';

ipcMain.handle('GET_CONSOLE', async () => {
  console.log(chalk.yellow(`GET_CONSOLE`));

  const outputArray = [];
  outputArray.push('Welcome to Peekaboo v0.0.1');
  return outputArray;
});

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

  const originalLocation = Buffer.from(
    found.originalLocation,
    'base64'
  ).toString('ascii');

  const cwd = vaultPath;
  const iv = found.iv;
  const salt = found.salt;
  const name = found.secureName;
  const explodeZipPath = `${cwd}\\${name}\\`;
  const zipPath = `${cwd}\\${name}.zip`;

  console.log('Now lets decrypt...');
  const decrypted = await decrypt(rawKey, cwd, iv, salt, name);
  console.log('Decryption secret (buffer)', decrypted.secret);
  console.log('Decryption secret (hex)', decrypted.secret.toString('hex'));
  console.log('Decryption tint', decrypted.tint);

  const dmetadataPath = `${cwd}\\${name}\\${name}.json`;
  const dencZipPath = `${cwd}\\${name}\\${name}.enc.zip`;

  await unpackZip(zipPath, explodeZipPath);
  await verifyMetadataAndChecksum(dmetadataPath, dencZipPath);
  await unpackZip(dencZipPath, originalLocation);
  await finaliseDecryption(cwd, name);

  console.log('Successfully decrypted');

  return null;
});

ipcMain.handle('ENCRYPT', async (event, pathToData) => {
  console.log(chalk.yellow(`ENCRYPT`, event, pathToData));

  const vaultPath = `${app.getPath('userData')}\\vault`;
  if (!fs.existsSync(vaultPath)) fs.mkdirSync(vaultPath);

  const isDirectory = await checkIfDirectory(pathToData);
  if (!checkExists(pathToData)) {
    console.error(`The target file doesn't exist!`);
    return false;
  }
  if (!isDirectory) {
    console.error(`Peekaboo only encrypts folders`);
    return false;
  }
  const name = uniqueName();

  console.log('Secure name: ', name);
  console.log('Is directory?: ', isDirectory);
  console.log(chalk.blue(`About to encrypt directory: ${pathToData} ...`));
  console.log(chalk.blue(`Will give object name of ${name}`));

  // todo: this might need reworking as it won't go behind the root to count
  let itemCount = 1;
  fs.readdir(pathToData, (err, files) => {
    itemCount = files.length;
  });

  // abstraction, but it keeps everything as cwd hereafter
  const cwd = vaultPath;
  const metadata = `${cwd}\\${name}.json`;
  const zipPath = `${cwd}\\${name}.zip`;
  const encZipPath = `${cwd}\\${name}.enc.zip`;
  const booPath = `${cwd}\\${name}.boo`;
  const packSize = await lstat(cwd);

  const exists = fs.existsSync(booPath);
  if (exists) {
    console.error(`The boo file already exists, cannot continue`);
    return false;
  }

  await packTarget(pathToData, encZipPath);
  await createMetaData(metadata, encZipPath);
  await createZip(encZipPath, metadata, zipPath);
  const encrypted = await encrypt(rawKey, zipPath, booPath);
  const salt = encrypted.salt;
  const iv = encrypted.iv;
  const finalised = await finaliseEncryption(cwd, name, salt, iv, pathToData);
  console.log('Encryption secret (buffer)', encrypted.secret);
  console.log('Encryption secret (hex)', encrypted.secret.toString('hex')); // todo: remove this
  console.log('Encryption complete', finalised);

  localStore = new Store({
    name: 'peekaboo',
    watch: true,
  });

  const storeContent = (await localStore.get('contents')) || [];
  storeContent.push({
    id: randomUUID(),
    iv: iv,
    salt: salt,
    color: shuffle(availableColors)[2],
    friendlyName: name,
    secureName: name,
    originalLocation: Buffer.from(pathToData).toString('base64'),
    peekabooLocation: Buffer.from(booPath).toString('base64'),
    status: 'locked',
    diskSize: packSize.size,
    itemCount: itemCount,
    created: dayjs().toDate(),
    modified: dayjs().toDate(),
  });
  localStore.set('contents', storeContent);
  console.log('Encryption operation complete');
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
