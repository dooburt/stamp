/* eslint-disable no-promise-executor-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable func-names */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
const chalk = require('chalk');
const AdmZip = require('adm-zip');
const tarStream = require('tar-stream');
const Gunzip = require('gunzip-maybe');
const {
  createWriteStream,
  createReadStream,
  unlinkSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require('fs');
const { readdir, lstat, writeFile, readFile } = require('node:fs/promises');
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
  createHash,
} = require('crypto');
const { pipeline, Readable } = require('stream');
const { promisify } = require('util');
const { resolve } = require('path');
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
 * Create checksum of given path, in a memory efficient way
 * @param {*} path path to the file we wish to checksum. If the path does not exist, will return null
 * @returns the check sum in hex, or null if the path cannot be found
 */
function createChecksum(path) {
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
  if (exists) return false;
  rmSync(targetPath, { recursive: true, force: true });
  return true;
};

const unpackZip = async (targetPath, outputPath) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

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

const explodeTarball = async (tarPath, outputPath) => {
  if (!tarPath) throw new Error('Need a tar path');
  if (!outputPath) throw new Error('Need a output path');

  return new Promise((resolve, reject) => {
    console.log('Exploding tarball...');
    try {
      const gunzip = Gunzip();
      const extract = tarStream.extract();
      const readStream = createReadStream(tarPath);

      // this line will be unnecessary when we cleanup
      if (!existsSync(outputPath)) mkdirSync(outputPath);

      extract.on('error', function (err) {
        console.log(err);
      });

      extract.on('finish', function () {
        console.log('Finished exploding tarball to', outputPath);
        resolve();
      });

      extract.on('entry', function (header, stream, next) {
        stream.on('end', function () {
          console.log('Tarball stream read');
          next();
        });
        stream.resume();
      });

      readStream.on('error', function (err) {
        console.log(err);
      });

      readStream.pipe(gunzip).pipe(extract);
    } catch (err) {
      console.error(err);
      reject();
    }
  });
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

  // const checksum = createHash('md5').update(boo).digest('hex');
  const checksum = await createChecksum(boo);
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
  const zip = `${cwd}\\${tint}-${name}.zip`;

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
  const decrypted = await decrypt(cwd, iv, salt, name);
  console.log('Decryption secret (buffer)', decrypted.secret);
  console.log('Decryption secret (hex)', decrypted.secret.toString('hex'));
  console.log('Decryption tint', decrypted.tint);

  const tint = decrypted.tint;
  const dzipPath = `${__dirname}\\${tint}-${name}.zip`;
  const explodeZipPath = `${__dirname}\\${tint}-${name}\\`;
  const dmetadataPath = `${__dirname}\\${tint}-${name}\\${name}.json`;
  const dtarPath = `${__dirname}\\${tint}-${name}\\${name}.tar`;
  const tintedTestFolderPath = `${__dirname}\\${tint}-test-folder\\`;

  await unpackZip(dzipPath, explodeZipPath);
  await verifyMetadataAndChecksum(dmetadataPath, dtarPath);
  await explodeTarball(dtarPath, tintedTestFolderPath);

  console.log('Successfully decrypted');

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
