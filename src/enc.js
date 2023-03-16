/* eslint-disable no-promise-executor-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
const {
  createWriteStream,
  createReadStream,
  unlinkSync,
  rmSync,
  existsSync,
} = require('fs');
const { readdir, lstat, writeFile, readFile } = require('node:fs/promises');
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
  createHash,
} = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { resolve } = require('path');
const { createGunzip } = require('zlib');
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

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );
  return Array.prototype.concat(...files);
}

/**
 * Given a path, it will sniff what the path is and determine what that path is, a file, files or a folder
 * @param {string} path What do you want sniffed?
 */
const encryptWhat = async (path) => {
  console.log(`encryptWhat`);
  const stats = await lstat(path);

  console.log(`Is file: ${stats.isFile()}`);
  console.log(`Is directory: ${stats.isDirectory()}`);
  console.log(`Is symbolic link: ${stats.isSymbolicLink()}`);
  console.log(`Is FIFO: ${stats.isFIFO()}`);
  console.log(`Is socket: ${stats.isSocket()}`);
  console.log(`Is character device: ${stats.isCharacterDevice()}`);
  console.log(`Is block device: ${stats.isBlockDevice()}`);

  return {
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  };
};

/**
 * Reads a given path, returning either a file or a directory
 * @param {string} path the path to read
 * @returns either the file or the directory data
 */
const readTarget = async (path) => {
  const stats = await encryptWhat(path);

  console.log('encryptWhat', stats, path);
  const { isDirectory } = stats;

  console.log('Target isDirectory?', isDirectory);

  if (isDirectory) {
    return readdir(path, { withFileTypes: true });
  }
  return readFile(path, (err, data) => {
    if (err) throw err;
    return data;
  });
};

const verifyChecksum = (pathToGunzip, existingChecksum) => {
  if (!pathToGunzip) throw new Error('Need a gunzip path');
  const checksum = createHash('md5').update(pathToGunzip).digest('hex');
  return checksum === existingChecksum;
};

const createMetaData = async (metadataPath, tarPath) => {
  if (!metadataPath) throw new Error('Need a metadata path');
  if (!tarPath) throw new Error('Need a tar path');
  const checksum = createHash('md5').update(tarPath).digest('hex');
  const stats = await lstat(tarPath);
  console.log('tar stats', stats);
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
  if (exists) return false;
  rmSync(targetPath, { recursive: true, force: true });
  return true;
};

const packTarget = async (targetPath, outputPath) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

  const stats = await lstat(targetPath);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
    const archive = archiver('tar', {
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
      archive.directory(targetPath, false);
    } else {
      const filename = path.basename(targetPath);
      archive.file(targetPath, filename);
    }

    archive.finalize();
  });
};

const finaliseEncryption = async (cwd, name, salt, iv, cleanup = false) => {
  if (!cwd)
    throw new Error('Need a current working directory where the files are');
  if (!name) throw new Error('Need the name of the encrypted operation');
  if (!salt) throw new Error('Need a salt');
  if (!iv) throw new Error('Need an IV');

  const boo = `${cwd}\\${name}.boo`;
  const tar = `${cwd}\\${name}.tar`;
  const zip = `${cwd}\\${name}.zip`;
  const json = `${cwd}\\${name}.json`;

  const checksum = createHash('md5').update(boo).digest('hex');
  const stats = await lstat(boo);

  if (cleanup) {
    console.log('Cleaning up...');
    unlinkSync(tar);
    unlinkSync(json);
    unlinkSync(zip);
    console.log('Done cleaning up...');
  }

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
 * Decrypt a boo file back into whatever it was before (a file or folder)
 * @param {string} booFilePath The path to either a file or folder we wish to encrypt
 * @param {string} iv Base64 initialisation vector from original encryption
 * @param {string} salt Base64 salt from original encryption
 * @param {string} outputPath Where do we put the decryption result? Typically, you put it back where it came from at encryption
 * @returns {object} An object with the `outputPath` returned
 */
const decrypt = async (booFilePath, iv, salt, outputPath) => {
  const hash = pbkdf2Sync(KEY, salt, 100, 32, 'sha256');
  const secretBuf = Buffer.from(hash, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');

  // if (!existsSync(endPath)) mkdirSync(endPath);

  await pipelineAsync(
    createReadStream(booFilePath),
    createGunzip(),
    createDecipheriv('aes-256-ctr', secretBuf, ivBuf),
    createWriteStream(outputPath)
  );

  return { outputPath };
};

const testFolderPath = `${__dirname}\\test-folder\\`;
const fromFilePath = './test.txt';
const booFilePath = './test.enc.boo';
// const zipPath = './test.enc.gz';
const finalFilePath = './test-decrypted.txt';

const go = async () => {
  console.log('__dirname', __dirname, testFolderPath);

  const files = await getFiles(testFolderPath);
  const target = await readTarget(testFolderPath);
  const name = uniqueName();

  console.log('files', files);
  console.log('target', target);
  console.log('name', name);

  const cwd = `${__dirname}\\`;
  const metadata = `${__dirname}\\${name}.json`;
  const zipPath = `${__dirname}\\${name}.zip`;
  const tarPath = `${__dirname}\\${name}.tar`;
  const booPath = `${__dirname}\\${name}.boo`;

  await packTarget(testFolderPath, tarPath);
  await createMetaData(metadata, tarPath);
  await createZip(tarPath, metadata, zipPath);
  const encrypted = await encrypt(zipPath, booPath);
  const salt = encrypted.salt;
  const iv = encrypted.iv;
  const finalised = await finaliseEncryption(cwd, name, salt, iv, false);
  console.log('Encryption secret (buffer)', encrypted.secret);
  console.log('Encryption secret (hex)', encrypted.secret.toString('hex'));
  console.log('Encryption complete', finalised);
  console.log('Now lets decrypt...');

  // encryptAndZip(testFolderPath);
  //console.log('Created encrypted gzip');

  // const encrypted = await encrypt(fromFilePath, gunzipPath, booFilePath);
  // const { iv } = encrypted;
  // const { salt } = encrypted;

  // console.log('Created metadata here', json);

  // const zip = `${__dirname}\\${name}.zip`;
  // createWrapperZip(name, gunzipPath, json, zip);

  // console.log('Created zip here', zip);

  // console.log(
  //   chalk.blue(
  //     `Encrypted successfully, got ${encrypted.secret} and ${iv} and salt ${salt}`
  //   )
  // );

  // const decrypted = await decrypt(booFilePath, iv, salt, finalFilePath);

  // console.log(
  //   chalk.green(`Decrypted successfully, got ${decrypted.outputPath} back`)
  // );
};

go();
