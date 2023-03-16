const chalk = require('chalk');
const {
  createWriteStream,
  createReadStream,
  existsSync,
  mkdirSync,
} = require('fs');
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  pbkdf2Sync,
} = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { createGzip, createGunzip } = require('zlib');

const pipelineAsync = promisify(pipeline);

const KEY = 'testkeysomemoreabsolutebollocks';

const encryptFile = async (startPath, zipPath, endFilePath) => {
  const salt = randomBytes(128).toString('base64');
  const hash = pbkdf2Sync(KEY, salt, 100, 32, 'sha256');
  // const secret = randomBytes(32);
  const iv = randomBytes(16);

  await pipelineAsync(
    createReadStream(startPath),
    createCipheriv('aes-256-ctr', hash, iv),
    createGzip(),
    createWriteStream(endFilePath)
  );

  return {
    salt,
    secret: hash,
    iv: iv.toString('base64'),
    zipPath,
  };
};

const decryptFile = async (endFilePath, iv, salt, endPath) => {
  const hash = pbkdf2Sync(KEY, salt, 100, 32, 'sha256');
  const secretBuf = Buffer.from(hash, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');

  // if (!existsSync(endPath)) mkdirSync(endPath);

  await pipelineAsync(
    createReadStream(endFilePath),
    createGunzip(),
    createDecipheriv('aes-256-ctr', secretBuf, ivBuf),
    createWriteStream(endPath)
  );

  return { endPath };
};

const fromFilePath = './test.txt';
const endFilePath = './test.enc.boo';
const zipPath = './test.enc.gz';
const finalFilePath = './test-decrypted.txt';

console.log(
  chalk.blue(
    `I'm going to encrypt: ${fromFilePath} and put it here: ${zipPath} and then create a boo file: ${endFilePath}`
  )
);

encryptFile(fromFilePath, zipPath, endFilePath)
  .then((result) => {
    console.log(
      chalk.blue(
        `Encrypted successfully, got ${result.secret} and ${result.iv} and salt ${result.salt}`
      )
    );
    return { secret: result.secret, iv: result.iv, salt: result.salt };
  })
  .then(({ secret, iv, salt }) => {
    console.log(chalk.green(`Decrypting... ${secret} and ${iv} with ${salt}`));
    console.log(
      chalk.green(`From ${endFilePath} and ${zipPath} to ${finalFilePath}`)
    );
    decryptFile(endFilePath, iv, salt, finalFilePath);
    return true;
  })
  .catch((err) => console.error(err));
