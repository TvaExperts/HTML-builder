const fs = require('fs');
const path = require('path');

const styleFolderPath = path.join(__dirname, './styles');
const distBundleFullPath = path.join(__dirname, './project-dist/bundle.css');

const writeStream = fs.createWriteStream(distBundleFullPath);

fs.readdir(styleFolderPath, { withFileTypes: true }, (error, data) => {
  if (error) {
    process.stdout.write(`Error with style folder: ${error}. Module is stopped\n`);
    return;
  }
  const styleFiles = data.filter((file) => file.isFile() && path.extname(file.name) === '.css');
  styleFiles.forEach(async (styleFile) => {
    const fileFullPath = path.join(styleFolderPath, styleFile.name);
    const readStream = fs.createReadStream(fileFullPath);
    readStream.on('data', (chank) => {
      writeStream.write(`${chank}\n`);
    });
  });
});
