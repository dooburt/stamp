const http = require('http');
const { createWriteStream, createReadStream } = require('fs');
const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

const downloadAndEncryptFile = async (uri, path) => {
  const response = await new Promise((resolve, reject) => {
    http.get(uri).on('response', resolve).on('error', reject);
  });

  const secret = randomBytes(32);
  const iv = randomBytes(16);

  await pipelineAsync(
    response,
    createCipheriv('aes-256-ctr', secret, iv),
    createWriteStream(path),
  );

  return { secret: secret.toString('base64'), iv: iv.toString('base64'), path };
};

const decryptFile = async ({ path, secret, iv }) => {
  const secretBuf = Buffer.from(secret, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');

  await pipelineAsync(
    createReadStream(path),
    createDecipheriv('aes-256-ctr', secretBuf, ivBuf),
    createWriteStream(`${path}-decrypted`),
  );
};

downloadAndEncryptFile('http://www.google.com/', 'encrypted-path')
  .then(decryptFile);