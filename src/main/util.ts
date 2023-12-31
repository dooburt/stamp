/* eslint-disable no-plusplus */
/* eslint-disable func-names */
/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-case-declarations */

import { createHash } from 'crypto';
import { createReadStream, existsSync, rmSync } from 'fs';

/* eslint import/prefer-default-export: off */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { lstat } = require('node:fs/promises');
const cp = require('child_process');
const os = require('os');
const { URL } = require('url');
const { app } = require('electron');
const { readdir, stat } = require('fs/promises');
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const appPath = app.getAppPath();
const assetPath = `${appPath}\\assets`;
const avatarPath = `${assetPath}\\avatars`;

const customConfig = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
  length: 2,
};

type EncryptedBlock = {
  iv: string;
  content: string;
};

export function uniqueName() {
  return uniqueNamesGenerator(customConfig);
}

export function getAssetsPath() {
  if (!fs.existsSync(assetPath)) {
    fs.mkdirSync(assetPath);
  }

  return assetPath;
}

export function getAvatarPath() {
  if (!fs.existsSync(avatarPath)) {
    fs.mkdirSync(avatarPath);
  }

  return avatarPath;
}

export const deleteTarget = (targetPath: string) => {
  if (!targetPath) throw new Error('Need a target path');
  const exists = existsSync(targetPath);
  if (!exists) return false;

  console.log('Deleting target', targetPath);

  rmSync(targetPath, { recursive: true, force: true });
  return true;
};

/**
 * Create checksum of given path, in a memory efficient way
 * @param {string} path path to the file we wish to checksum. If the path does not exist, will return null
 * @returns the check sum in hex, or null if the path cannot be found
 */
export function createChecksum(path: string) {
  console.log('Checksum on', path);
  return new Promise(function (resolve, reject) {
    if (!existsSync(path)) resolve(null);

    const hash = createHash('md5');
    const input = createReadStream(path);

    input.on('error', reject);

    input.on('data', function (chunk: any) {
      hash.update(chunk);
    });

    input.on('close', function () {
      resolve(hash.digest('hex'));
    });
  });
}

export function getRandomAvatar() {
  const avatars = fs.readdirSync(avatarPath);

  const listAvatars = () => {
    return avatars.map((filename: string) => {
      const filePath = path.resolve(assetPath, filename);
      const fileStats = fs.statSync(filePath);

      return {
        name: filename,
        path: filePath,
        size: Number(fileStats.size / 1000).toFixed(1), // kb
      };
    });
  };

  console.log('avatars', listAvatars());
}

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const encrypt = (text: string, secretKey: string) => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  };
};

export const decrypt = (hash: EncryptedBlock, secretKey: string) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, 'hex')
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
};

export function getComputerName() {
  switch (process.platform) {
    case 'win32':
      return process.env.COMPUTERNAME;
    case 'darwin':
      return cp.execSync('scutil --get ComputerName').toString().trim();
    case 'linux':
      const prettyname = cp.execSync('hostnamectl --pretty').toString().trim();
      return prettyname === '' ? os.hostname() : prettyname;
    default:
      return os.hostname();
  }
}

export const byteSize = (str: any) => new Blob([str]).size;

export const dirSize = async (directory: string) => {
  const files = await readdir(directory);
  const stats = files.map((file: any) => stat(path.join(directory, file)));

  return (await Promise.all(stats)).reduce(
    (accumulator, { size }) => accumulator + size,
    0
  );
};

export function getFilesInDirectory(pathToDirectory: string) {
  return fs.readdirSync(pathToDirectory);
}

/**
 * Shuffle the given data before picking.
 * The fixed index on usage is intentional and can be any fixed number within range
 * Usage: `shuffle(addresses)[2]`
 * @param {Array} array of data to shuffle
 * @returns {Array} a reshuffled array
 */
export const shuffle = (arr: any) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a random string of letters and numbers. Not cryptographically secure.
 * @param {number} length how long do you want the random string to be?
 * @returns {string} the string of random characters
 */
export const generateRandomString = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const checkExists = (targetPath: string) => {
  return existsSync(targetPath);
};

export const checkIfDirectory = async (targetPath: string) => {
  const stats = await lstat(targetPath);
  return stats.isDirectory();
};
