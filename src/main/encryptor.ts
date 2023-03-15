/* eslint-disable no-bitwise */
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createCipheriv, createHash, createHmac, randomBytes } from 'crypto';

// C:\Users\dooburt\AppData\Roaming\peekaboo\vault

const zerosalt = new Uint8Array(8);

function deriveKeys(key: Uint8Array, name: string) {
  const prk = createHmac('sha256', zerosalt).update(key).digest();
  const b = Buffer.alloc(1, 1);
  const aesKey = createHmac('sha256', prk)
    .update(name, 'utf-8')
    .update(b)
    .digest();
  b[0] = 2;
  const hmacKey = createHmac('sha256', prk)
    .update(aesKey)
    .update(name, 'utf-8')
    .update(b)
    .digest();
  return [aesKey, hmacKey];
}

/**
 * encrypt the things
 *
 * @param {string} pathToZip the path to the zip file that we are going to encrypt
 * @param {Uint8Array} key the encryption key to use
 * @param {string} pathToBoo the path to the final boo file we wish to create
 */
async function encryptionPipe(
  pathToZip: string,
  key: string,
  pathToBoo: string
) {
  // https://fireship.io/lessons/node-crypto-examples/
  // https://matrix-org.github.io/matrix-js-sdk/6.0.0-rc.1/crypto_aes.js.html
  // we must store the IV, it is required for decryption
  const hash = createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);
  const iv = randomBytes(16);

  console.log('iv', iv);
  console.log('iv hex', iv.toString('hex'));
  console.log('iv sliced', iv.toString('hex').slice(0, 16));

  const data = await pipeline(
    createReadStream(pathToZip),
    createCipheriv('aes-256-ctr', hash, iv).setAutoPadding(true),
    createWriteStream(pathToBoo)
  );
  console.log('Encryption pipe', data, iv, hash);

  return { data, iv: iv.toString('hex'), hash };
}

export default encryptionPipe;
