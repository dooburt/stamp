/* eslint-disable no-console */
/* eslint-disable func-names */
const { lstat } = require('node:fs/promises');
const path = require('path');
const AdmZip = require('adm-zip');
const { createWriteStream } = require('fs');
const archiver = require('archiver');

const packTarget = async (targetPath: string, outputPath: string) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

  const stats = await lstat(targetPath);

  console.log('Packing target', targetPath);
  console.log('Target stats', stats);

  return new Promise((resolve, reject) => {
    const output = createWriteStream(outputPath);
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

    if (stats.isDirectory()) {
      console.log('Packing directory...');
      archive.directory(targetPath, false);
    } else {
      const filename = path.basename(targetPath);
      console.log('Packing file...', targetPath, filename);
      archive.file(targetPath, { name: filename });
    }

    archive.finalize();
  });
};

function createZip(tarPath: string, metadataPath: string, outputPath: string) {
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

const unpackZip = async (targetPath: string, outputPath: string) => {
  if (!targetPath) throw new Error('Need a target path');
  if (!outputPath) throw new Error('Need a output path');

  console.log('Unpacking', targetPath, 'to', outputPath);

  const zip = new AdmZip(targetPath);
  zip.extractAllTo(outputPath, true);
};

export { packTarget, createZip, unpackZip };
