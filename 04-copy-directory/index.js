const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

const sourceFolderPath = path.join(__dirname, './files');
const destFolderPath = path.join(__dirname, './files-copy');

const copyFiles = async () => {
  try {
    await fsRm(destFolderPath);
    await fsPromises.mkdir(destFolderPath, { recursive: true });
    await fsPromises
      .readdir(sourceFolderPath, { withFileTypes: true })
      .then(async (files) => {
        for (const file of files) {
          if (file.isFile()) {
            const sourceFile = path.join(sourceFolderPath, file.name);
            const destFile = path.join(destFolderPath, file.name);
            await fsPromises.copyFile(sourceFile, destFile);
          }
        }
      });
  } catch (error) {
    console.error(error);
  }
};

const fsRm = (dir) => {
  return new Promise((resolve, reject) => {
    fs.rm(dir, { recursive: true }, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(new Error(err));
      }
      resolve();
    });
  });
};

copyFiles();
