const path = require('path');
const fsPromises = require('fs/promises');

const sourceFolderPath = path.join(__dirname, './files');
const destFolderPath = path.join(__dirname, './files-copy');

const copyFiles = async () => {
  try {
    await fsPromises.rm(destFolderPath, { force: true, recursive: true });
    await fsPromises.mkdir(destFolderPath, { recursive: true });
    const files = await fsPromises.readdir(sourceFolderPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const sourceFile = path.join(sourceFolderPath, file.name);
        const destFile = path.join(destFolderPath, file.name);
        await fsPromises.copyFile(sourceFile, destFile);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

copyFiles();
