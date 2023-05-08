const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const styleFolderPath = path.join(__dirname, './styles');
const distBundleFullPath = path.join(__dirname, './project-dist/bundle.css');

const buildBundle = async () => {
  try {
    const files = await fsPromises.readdir(styleFolderPath, { withFileTypes: true });
    const styleFiles = files.filter((file) => file.isFile() && path.extname(file.name) === '.css');
    const styleData = [];
    for (const slyleFile of styleFiles) {
      const filePath = path.join(styleFolderPath, slyleFile.name);
      const fileData = await readDataFromFile(filePath);
      styleData.push(fileData);
    }
    const writeStream = fs.createWriteStream(distBundleFullPath);
    let dataForWrite = '';
    styleData.forEach((data) => {
      dataForWrite += data;
    });
    writeStream.write(dataForWrite);
  } catch (error) {
    console.error(error);
  }
};

const readDataFromFile = (file) => {
  return new Promise((resolve, reject) => {
    let data = '';
    const readStream = fs.createReadStream(file);

    readStream.on('error', (error) => {
      reject(new Error(error));
    });
    readStream.on('data', (chank) => {
      data += chank.toString();
    });
    readStream.on('end', () => {
      data += '\n';
      resolve(data);
    });
  });
};

buildBundle();
