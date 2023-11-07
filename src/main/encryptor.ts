/* eslint-disable no-console */
/* eslint-disable no-bitwise */
const chalk = require('chalk');
const { createCipheriv, pbkdf2Sync, randomBytes } = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { createWriteStream, createReadStream, unlinkSync } = require('fs');
const { lstat, writeFile } = require('node:fs/promises');
const { createChecksum, deleteTarget } = require('./util');

const pipelineAsync = promisify(pipeline);

const finaliseEncryption = async (
  cwd: string,
  name: string,
  salt: string,
  iv: string,
  originalTarget: string
) => {
  if (!cwd)
    throw new Error('Need a current working directory where the files are');
  if (!name) throw new Error('Need the name of the encrypted operation');
  if (!salt) throw new Error('Need a salt');
  if (!iv) throw new Error('Need an IV');

  const boo = `${cwd}\\${name}.boo`;
  const tar = `${cwd}\\${name}.enc.zip`;
  const zip = `${cwd}\\${name}.zip`;
  const json = `${cwd}\\${name}.json`;

  // const checksum = createHash('md5').update(boo).digest('hex');
  const checksum = await createChecksum(boo);
  const stats = await lstat(boo);

  console.log('Cleaning up...');
  unlinkSync(tar);
  unlinkSync(json);
  unlinkSync(zip);
  deleteTarget(originalTarget);
  console.log('Done cleaning up...');

  return {
    name,
    cwd,
    salt,
    iv,
    checksum,
    stats,
    path: boo,
  };
};

const createMetaData = async (metadataPath: string, tarPath: string) => {
  if (!metadataPath) throw new Error('Need a metadata path');
  if (!tarPath) throw new Error('Need a tar path');
  // const checksum = createHash('md5').update(tarPath).digest('hex');
  const checksum = await createChecksum(tarPath);
  const stats = await lstat(tarPath);
  console.log(chalk.yellow('TAR Checksum', checksum));
  const json = {
    path: tarPath,
    stats,
    checksum,
  };

  await writeFile(metadataPath, JSON.stringify(json));
  return true;
};

/**
 * Encrypt a file into a boo file
 * @param {string} key String key/password
 * @param {string} zipPath The path to the zip we are going to encrypt
 * @param {string} booPath The path to the final *.boo file that contains the encrypted contents
 * @returns {object} containing the `salt` and `iv`
 */
const encrypt = async (key: string, zipPath: string, booPath: string) => {
  if (!key) throw new Error('Need a key');
  if (!zipPath) throw new Error('Need a zip path');
  if (!booPath) throw new Error('Need a boo path');

  const salt = randomBytes(128).toString('base64');
  const hash = pbkdf2Sync(key, salt, 1000, 32, 'sha256');
  const iv = randomBytes(16);

  await pipelineAsync(
    createReadStream(zipPath),
    createCipheriv('aes-256-ctr', hash, iv),
    createWriteStream(booPath)
  );

  // todo: ok here for experimentation, but secret cannot be returned in app
  return {
    salt,
    secret: hash,
    iv: iv.toString('base64'),
  };
};

export { finaliseEncryption, encrypt, createMetaData };
