/* eslint-disable no-console */
const chalk = require('chalk');
const { pipeline } = require('stream');
const { promisify } = require('util');
const {
  createWriteStream,
  createReadStream,
  existsSync,
  unlinkSync,
} = require('fs');
const {
  createDecipheriv,

  pbkdf2Sync,
} = require('crypto');
const { readFile } = require('node:fs/promises');
const {
  generateRandomString,
  createChecksum,
  deleteTarget,
} = require('./util');

const pipelineAsync = promisify(pipeline);

/**
 * Decrypt a boo file
 * @param {string} key The key/password string
 * @param {string} cwd Current working directory
 * @param {string} iv Base64 initialisation vector from original encryption
 * @param {string} salt Base64 salt from original encryption
 * @param {string} name Name of the boo
 * @returns {object} Will decrypt to a <boo-name>.zip file of the if able
 */
const decrypt = async (
  key: string,
  cwd: string,
  iv: string,
  salt: string,
  name: string
) => {
  if (!key) throw new Error('Need the key');
  if (!cwd)
    throw new Error('Need a current working directory where the boo file is');
  if (!iv) throw new Error('Need an initialisation vector');
  if (!salt) throw new Error('Need the salt');
  if (!name) throw new Error('Need the name');

  // we only tint the zip
  const tint = generateRandomString(5).toLowerCase();
  const boo = `${cwd}\\${name}.boo`;
  const zip = `${cwd}\\${name}.zip`;

  if (!existsSync(boo)) throw new Error(`${boo} doesn't exist`);

  const hash = pbkdf2Sync(key, salt, 1000, 32, 'sha256');
  const secretBuf = Buffer.from(hash, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');

  await pipelineAsync(
    createReadStream(boo),
    createDecipheriv('aes-256-ctr', secretBuf, ivBuf),
    createWriteStream(zip)
  );

  return { zip, name, secret: secretBuf, iv: ivBuf, salt, hash, tint };
};

const verifyMetadataAndChecksum = async (
  metadataPath: string,
  tarPath: string
) => {
  if (!metadataPath) throw new Error('Need a metadata path');
  if (!tarPath) throw new Error('Need a tar path');

  console.log('Verifying checksum...');

  const metadata = await readFile(metadataPath, { encoding: 'utf-8' });
  // const checksum = createHash('md5').update(tarPath).digest('hex');
  const checksum = await createChecksum(tarPath);

  try {
    const json = JSON.parse(metadata);

    console.log('Metadata JSON', json);
    console.log('V1', json.checksum);
    console.log('V2', checksum);

    if (json.checksum !== checksum) {
      throw new Error('Checksum mismatch');
    }
    console.log(chalk.green('Checksum verified'));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

const finaliseDecryption = async (cwd: string, name: string) => {
  if (!cwd)
    throw new Error('Need a current working directory where the files are');
  if (!name) throw new Error('Need the name of the encrypted operation');

  const tmp = `${cwd}\\${name}\\`;
  const zip = `${cwd}\\${name}.zip`;
  const boo = `${cwd}\\${name}.boo`;

  console.log('Cleaning up...');
  unlinkSync(zip);
  unlinkSync(boo);
  deleteTarget(tmp);
  console.log('Done cleaning up...');

  return {
    name,
    cwd,
  };
};

export { decrypt, verifyMetadataAndChecksum, finaliseDecryption };
