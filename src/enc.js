/* eslint-disable no-plusplus */
/* eslint-disable no-promise-executor-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
const chalk = require('chalk');
const AdmZip = require('adm-zip');
const {
  createWriteStream,
  createReadStream,
  unlinkSync,
  rmSync,
  existsSync,
} = require('fs');
const { lstat, writeFile, readFile } = require('node:fs/promises');
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
  createHash,
} = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const archiver = require('archiver');
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require('unique-names-generator');
const path = require('path');

const pipelineAsync = promisify(pipeline);

const KEY = 'testkeysomemoreabsolutebollocks';
const customConfig = {
  dictionaries: [adjectives, colors, animals],
  separator: '-',
  length: 2,
};

function uniqueName() {
  return uniqueNamesGenerator(customConfig);
}

/**
 * So step-by-step this is what should happen:
 * 1. We have an "encryptWhat" sniff function that determines whether we have files
 * or folders or a single file.
 * 2. It creates a .json metadata file for this encryption. This contains that
 * encryptWhat sniff result - plus anything else we care about (like a checksum) of
 * what we're encrypting perhaps.
 * 3. We put both files into a gunzip
 * 4. We encrypt the gunzip into a boo file (making the file impossible to open)
 *
 * For decryption
 * 1. We open the boo file
 * 2. We decrypt the boo file
 * 3. We unzip the gunzip and read the json metadata (perhaps with checksum check)
 * 4. We write the gunzip contents to their original location
 */

/**
 * Create checksum of given path, in a memory efficient way
 * @param {*} path path to the file we wish to checksum. If the path does not exist, will return null
 * @returns the check sum in hex, or null if the path cannot be found
 */
function createChecksum(path) {
  console.log('Checksum on', path);
  return new Promise(function (resolve, reject) {
    if (!existsSync(path)) resolve(null);

    const hash = createHash('md5');
    const input = createReadStream(path);

    input.on('error', reject);

    input.on('data', function (chunk) {
      hash.update(chunk);
    });

    input.on('close', function () {
      resolve(hash.digest('hex'));
    });
  });
}

/**
 * Generate a random string of letters and numbers. Not cryptographically secure.
 * @param {number} length how long do you want the random string to be?
 * @returns {string} the string of random characters
 */
const generateRandomString = (length) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const createMetaData = async (metadataPath, tarPath) => {
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

function createZip(tarPath, metadataPath, outputPath) {
  if (!tarPath) throw new Error('Need a tar path');
  if (!metadataPath) throw new Error('Need a metadata path');
  if (!outputPath) throw new Error('Need a output zip path');

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);

    const tarFileName = path.basename(tarPath);
    const metadataName = path.basename(metadataPath);

    console.log('tarFileName', tarFileName);
    console.log('metadataName', metadataName);

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archive close');
      resolve({ archive: outputPath, size: archive.pointer() });
    });

    output.on('end', function () {
      console.log('Archive end');
      resolve({ archive: outputPath, size: archive.pointer() });
    });

    archive.on('warning', console.warn);
    archive.on('error', reject);

    archive.pipe(output);
    archive.file(tarPath, { name: tarFileName });
    archive.file(metadataPath, { name: metadataName });
    archive.finalize();
  });
}

const deleteTarget = (targetPath) => {
  if (!targetPath) throw new Error('Need a target path');
  const exists = existsSync(targetPath);
  if (!exists) return false;

  console.log('Deleting target', targetPath);

  rmSync(targetPath, { recursive: true, force: true });
  return true;
};

const unpackZip = async (targetPath, outputPath) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

  console.log('Unpacking', targetPath, 'to', outputPath);

  const zip = new AdmZip(targetPath);
  zip.extractAllTo(outputPath, true);
};

const verifyMetadataAndChecksum = async (metadataPath, tarPath) => {
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

const packTarget = async (targetPath, outputPath) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

  const stats = await lstat(targetPath);

  console.log('Packing target', targetPath);
  console.log('Target stats', stats);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archive close');
      resolve({ archive: outputPath, size: archive.pointer() });
    });

    output.on('end', function () {
      console.log('Archive end');
      resolve({ archive: outputPath, size: archive.pointer() });
    });

    archive.on('warning', console.warn);
    archive.on('error', reject);
    archive.pipe(output);

    if (stats.isDirectory()) {
      console.log('Packing directory...');
      archive.directory(targetPath, false);
    } else {
      const filename = path.basename(targetPath);
      console.log('Packing file...', targetPath, filename);
      archive.file(targetPath, { name: filename });
    }

    archive.finalize();
  });
};

const finaliseDecryption = async (cwd, name) => {
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

const finaliseEncryption = async (cwd, name, salt, iv, originalTarget) => {
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

/**
 * Encrypt a file into a boo file
 * @param {string} zipPath The path to the zip we are going to encrypt
 * @param {string} booPath The path to the final *.boo file that contains the encrypted contents
 * @returns {object} containing the `salt` and `iv`
 */
const encrypt = async (zipPath, booPath) => {
  if (!zipPath) throw new Error('Need a zip path');
  if (!booPath) throw new Error('Need a boo path');

  const salt = randomBytes(128).toString('base64');
  const hash = pbkdf2Sync(KEY, salt, 1000, 32, 'sha256');
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

/**
 * Decrypt a boo file
 * @param {string} booPath The path to either a file we wish to decrypt
 * @param {string} iv Base64 initialisation vector from original encryption
 * @param {string} salt Base64 salt from original encryption
 * @param {string} name Name of the boo
 * @returns {object} Will decrypt to a <boo-name>.zip file of the if able
 */
const decrypt = async (cwd, iv, salt, name) => {
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

  const hash = pbkdf2Sync(KEY, salt, 1000, 32, 'sha256');
  const secretBuf = Buffer.from(hash, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');

  await pipelineAsync(
    createReadStream(boo),
    createDecipheriv('aes-256-ctr', secretBuf, ivBuf),
    createWriteStream(zip)
  );

  return { zip, name, secret: secretBuf, iv: ivBuf, salt, hash, tint };
};

const checkExists = (targetPath) => {
  return existsSync(targetPath);
};

const checkIfDirectory = async (targetPath) => {
  const stats = await lstat(targetPath);
  return stats.isDirectory();
};

const testFolderPath = `${__dirname}\\peekaboo-test-folder\\`;

const go = async () => {
  console.log('__dirname', __dirname, testFolderPath);

  const isDirectory = await checkIfDirectory(testFolderPath);
  if (!checkExists(testFolderPath)) {
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

  const cwd = `${__dirname}\\`;
  const explodeZipPath = `${__dirname}\\${name}\\`;
  const metadata = `${__dirname}\\${name}.json`;
  const zipPath = `${__dirname}\\${name}.zip`;
  const encZipPath = `${__dirname}\\${name}.enc.zip`;
  const booPath = `${__dirname}\\${name}.boo`;

  await packTarget(testFolderPath, encZipPath);
  await createMetaData(metadata, encZipPath);
  await createZip(encZipPath, metadata, zipPath);
  const encrypted = await encrypt(zipPath, booPath);
  const salt = encrypted.salt;
  const iv = encrypted.iv;
  const finalised = await finaliseEncryption(
    cwd,
    name,
    salt,
    iv,
    testFolderPath
  );
  console.log('Encryption secret (buffer)', encrypted.secret);
  console.log('Encryption secret (hex)', encrypted.secret.toString('hex'));
  console.log('Encryption complete', finalised);

  console.log('Now lets decrypt...');
  const decrypted = await decrypt(cwd, iv, salt, name);
  console.log('Decryption secret (buffer)', decrypted.secret);
  console.log('Decryption secret (hex)', decrypted.secret.toString('hex'));
  console.log('Decryption tint', decrypted.tint);

  const dmetadataPath = `${__dirname}\\${name}\\${name}.json`;
  const dencZipPath = `${__dirname}\\${name}\\${name}.enc.zip`;

  await unpackZip(zipPath, explodeZipPath);
  await verifyMetadataAndChecksum(dmetadataPath, dencZipPath);
  await unpackZip(dencZipPath, testFolderPath);
  await finaliseDecryption(cwd, name);

  console.log('Successfully decrypted');
  return true;
};

go();
