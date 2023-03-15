import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { createDecipheriv, createHash } from 'crypto';

async function decryptionPipe(
  pathToBoo: string,
  key: string,
  encodedIv: string,
  zipLocation: string
) {
  // we must store the IV, it is required for decryption
  const hash = createHash('sha256')
    .update(String(key))
    .digest('base64')
    .substr(0, 32);

  const iv = Buffer.from(encodedIv, 'hex');

  console.log('pathToBoo', pathToBoo);
  console.log('key', key);
  console.log('encodedIv', encodedIv);
  console.log('iv', iv);
  // console.log('decoded iv', Buffer.from(iv).toString('hex'));
  console.log('hash', hash);
  console.log('zipLocation', zipLocation);

  const data = await pipeline(
    createReadStream(pathToBoo),
    createDecipheriv('aes-256-ctr', hash, iv).setAutoPadding(true),
    createWriteStream(zipLocation)
  );

  // const hash = createHash('sha256')
  //   .update(String(key))
  //   .digest('base64')
  //   .substr(0, 32);
  // const data = await pipeline(
  //   createReadStream(pathToBoo),
  //   createCipheriv('aes-256-cbc', hash, iv),
  //   createWriteStream(pathToBoo)
  // );
  console.log('Decryption pipe', data, iv);

  return { data };
}

export default decryptionPipe;
