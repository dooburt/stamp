/* eslint import/prefer-default-export: off */
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { URL } = require('url');
const { app } = require('electron');

const algorithm = 'aes-256-ctr';
const iv = crypto.randomBytes(16);

const appPath = app.getAppPath();
const assetPath = `${appPath}\\assets`;
const avatarPath = `${assetPath}\\avatars`;

type EncryptedBlock = {
  iv: string;
  content: string;
};

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
