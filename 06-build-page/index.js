const fs = require('fs');
const path = require('path');

// source Paths

const assetsFolderName = './assets';

const styleFolderPath = path.join(__dirname, './styles');
const templateFilePath = path.join(__dirname, './template.html');
const componentsFolderPath = path.join(__dirname, './components');

// dist Paths

const distFullPath = path.join(__dirname, './project-dist');
const distStyleFilePath = path.join(distFullPath, 'style.css');
const distHtmlFilePath = path.join(distFullPath, 'index.html');

const removeOldDist = (dir) => {
  return new Promise((resolve, reject) => {
    fs.rm(dir, { recursive: true }, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      }
      resolve(dir);
    });
  });
};

const createDistFolder = (dir) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (err) {
        reject(err);
        return;
      }
      process.stdout.write(`Folder ${distFullPath} was created successful\n`);
      resolve();
    });
  });
};

const readComponentsHtmlFiles = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, { withFileTypes: true }, (error, data) => {
      if (error) {
        reject(error);
      }
      const componentsArr = [];
      const templatesFiles = data.filter((file) => file.isFile() && path.extname(file.name) === '.html');
      Promise.all(
        templatesFiles.map((templatesFile) => {
          return new Promise((res, rej) => {
            const filePath = path.join(componentsFolderPath, templatesFile.name);
            fs.readFile(filePath, (error, data) => {
              if (error) {
                rej(error);
              }
              const componentData = {};
              componentData.name = templatesFile.name.slice(0, templatesFile.name.lastIndexOf('.'));
              componentData.html = data.toString();
              componentsArr.push(componentData);
              res();
            });
          });
        })
      ).then(() => resolve(componentsArr));
    });
  });
};

const buildHtmlPageFromTemplate = (template, components) => {
  return new Promise((resolve, reject) => {
    fs.readFile(template, (error, data) => {
      if (error) {
        reject(error);
      }
      let templateData = data.toString();
      components.forEach((component) => {
        templateData = templateData.replace(`{{${component.name}}}`, component.html);
      });
      const writeStream = fs.createWriteStream(distHtmlFilePath);
      writeStream.write(templateData);
      resolve();
    });
  });
};

const readStylesData = (stylesFolder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(stylesFolder, { withFileTypes: true }, (error, data) => {
      if (error) {
        return reject(error);
      }
      const stylesData = [];
      const styleFiles = data.filter((file) => file.isFile() && path.extname(file.name) === '.css');
      Promise.all(
        styleFiles.map((styleFile) => {
          return new Promise((res, rej) => {
            const fileFullPath = path.join(styleFolderPath, styleFile.name);
            const readStream = fs.createReadStream(fileFullPath);
            readStream.on('error', (err) => {
              rej(err);
            });
            readStream.on('data', (chank) => {
              stylesData.push(`${chank}\n`);
            });
            readStream.on('end', () => {
              return res();
            });
          });
        })
      ).then(() => resolve(stylesData));
    });
  });
};

const copyAssetsFiles = (folderName) => {
  const distAssetsFolderPath = path.join(distFullPath, folderName);
  fs.mkdir(distAssetsFolderPath, (err) => {
    if (err) return console.log(err);
    copyAllFiles(folderName);
  });
};

const buildStyleBundle = (bundlePath, stylesData) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(bundlePath);
    stylesData.forEach((data) => {
      writeStream.write(data, (err) => {
        reject(err);
      });
    });
    resolve();
  });
};

const copyAllFiles = (dir) => {
  const fullPath = path.join(__dirname, dir);
  fs.readdir(fullPath, { withFileTypes: true }, (err, items) => {
    items.forEach((item) => {
      if (item.isDirectory()) {
        fs.mkdir(path.join(distFullPath, dir, item.name), (err) => {
          if (err) return console.log(err);
          copyAllFiles(path.join(dir, item.name));
        });
      } else {
        fs.copyFile(path.join(fullPath, item.name), path.join(distFullPath, dir, item.name), (err) => {
          if (err) return console.log(err);
        });
      }
    });
  });
};

removeOldDist(distFullPath) // Удаляем прошлую версию папки есть она есть
  .then((dir) => createDistFolder(dir)) // Создаем папку назначения
  .then(() => readComponentsHtmlFiles(componentsFolderPath)) // Считывавем компоненты страницы
  .then((components) => buildHtmlPageFromTemplate(templateFilePath, components)) // Правим темплейт страницы, заполняя его компонентами где необходимо и записываем итог
  .then(() => readStylesData(styleFolderPath)) // Считываем файлы стилей в массив
  .then((stylesData) => buildStyleBundle(distStyleFilePath, stylesData)) // Записываем данные стилей из массива в бандл
  .then(() => copyAssetsFiles(assetsFolderName)) // Копируем рекурсивно папку с ассетами
  .catch((error) => console.log(error)); // Отлавливаем ошибки по ходу работы
