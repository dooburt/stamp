import { pipeline } from 'stream/promises';
import {
  createReadStream,
  createWriteStream,
  readFileSync,
  writeFileSync,
} from 'fs';
import { createDecipheriv, pbkdf2Sync } from 'crypto';

async function decryptionPipe(
  pathToBoo: string,
  key: string,
  encodedIv: string,
  salt: string,
  zipLocation: string
) {
  // we must store the IV, it is required for decryption
  // const hash = createHash('sha256')
  //   .update(String(key))
  //   .digest('base64')
  //   .substr(0, 32);

  const hash = pbkdf2Sync(String(key), salt, 10000, 32, 'sha256');
  const iv = Buffer.from(encodedIv, 'hex');

  console.log('pathToBoo', pathToBoo);
  console.log('key', key);
  console.log('encodedIv', encodedIv);
  console.log('iv', iv, iv.length);
  console.log('salt', salt);
  console.log('hash (should be the same)', hash, hash.length);
  console.log('zipLocation', zipLocation);

  const booFile = readFileSync(pathToBoo);
  const decipher = createDecipheriv('aes-256-cbc', hash, iv).setAutoPadding(
    true
  );

  let decrypted = decipher.update(booFile);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  writeFileSync(zipLocation, decrypted);

  // const data = await pipeline(
  //   createReadStream(pathToBoo),
  //   createDecipheriv('aes-256-cbc', hash, iv).setAutoPadding(true),
  //   createWriteStream(zipLocation)
  // );

  // const hash = createHash('sha256')
  //   .update(String(key))
  //   .digest('base64')
  //   .substr(0, 32);
  // const data = await pipeline(
  //   createReadStream(pathToBoo),
  //   createCipheriv('aes-256-cbc', hash, iv),
  //   createWriteStream(pathToBoo)
  // );
  // console.log('Decryption pipe', data, iv);

  return { location: zipLocation };
}

export default decryptionPipe;
