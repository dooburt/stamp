/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// get application directory
// const appDir = path.resolve(os.homedir(), 'Peekaboo');
const appDir = app.getPath('home');
const peekabooDir = `${appDir}//.peekaboo`;
const peekabooFile = `${peekabooDir}/peekaboo.boo`;

const checkAndCreatePeekabooDir = () => {
  if (!fs.existsSync(peekabooDir)) {
    fs.mkdirSync(peekabooDir);
  }
};

const checkForPeekabooFile = () => {
  return fs.existsSync(peekabooFile);
};

// async function writePeekabooFile() {
//   checkAndCreatePeekabooDir();

//   if (!checkForPeekabooFile()) return null;

//   // try {
//   //   await fs.promise.writeFile(peekabooFile, 'utf-8')
//   // }
// }

async function getPeekabooFile() {
  checkAndCreatePeekabooDir();

  if (!checkForPeekabooFile()) return null;

  try {
    const file = await fs.promise.readFile(peekabooFile, 'utf-8');
    return file;
  } catch (err) {
    console.error(err);
  }
  return null;
}

const getFiles = () => {
  const files = fs.readdirSync(appDir);

  return files.map((filename: string) => {
    const filePath = path.resolve(appDir, filename);
    const fileStats = fs.statSync(filePath);

    return {
      name: filename,
      path: filePath,
      size: Number(fileStats.size / 1000).toFixed(1), // kb
    };
  });
};

export {
  getPeekabooFile,
  checkAndCreatePeekabooDir,
  checkForPeekabooFile,
  getFiles,
  appDir,
};
