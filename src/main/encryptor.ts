import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createCipheriv, randomBytes, createHash } from 'crypto';

async function encryptionPipe(
  pathToZip: string,
  key: string,
  pathToBoo: string
) {
  // we must store the IV, it is required for decryption
  const hash = createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);
  const iv = randomBytes(16).toString('hex').slice(0, 16);
  const data = await pipeline(
    createReadStream(pathToZip),
    createCipheriv('aes-256-cbc', hash, iv),
    createWriteStream(pathToBoo)
  );
  console.log('Encryption pipe', data, iv, hash);

  return { data, iv, hash };
}

export default encryptionPipe;
