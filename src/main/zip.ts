/* eslint-disable no-console */
/* eslint-disable func-names */
import fs from 'fs';
import archiver from 'archiver';

function zip(
  pathToData: string,
  vaultPath: string,
  obsfucatedName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const zipFile = `${vaultPath}\\${obsfucatedName}.zip`;
    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archive close');
      resolve(zipFile);
    });

    output.on('end', function () {
      console.log('Archive end');
      resolve(zipFile);
    });

    archive.on('warning', console.warn);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(pathToData, false).finalize();
  });
}

export default zip;
