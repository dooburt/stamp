/* eslint-disable no-console */
/* eslint-disable func-names */
import fs from 'fs';
import archiver from 'archiver';

type Zipped = {
  archive: string;
  size: number;
};

function zip(
  pathToData: string,
  vaultPath: string,
  obsfucatedName: string
): Promise<Zipped> {
  return new Promise((resolve, reject) => {
    const zipFile = `${vaultPath}\\${obsfucatedName}.zip`;
    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', function () {
      console.log(`${archive.pointer()} total bytes`);
      console.log('Archive close');
      resolve({ archive: zipFile, size: archive.pointer() });
    });

    output.on('end', function () {
      console.log('Archive end');
      resolve({ archive: zipFile, size: archive.pointer() });
    });

    archive.on('warning', console.warn);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(pathToData, false).finalize();
  });
}

export default zip;
