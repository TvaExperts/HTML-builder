const fs = require('fs');
const path = require('path');
const fsPromises = fs.promises;

// source Paths

const assetsFolderName = './assets';

const styleFolderPath = path.join(__dirname, './styles');
const templateFilePath = path.join(__dirname, './template.html');
const componentsFolderPath = path.join(__dirname, './components');

// dist Paths

const distFullPath = path.join(__dirname, './project-dist');
const distStyleFilePath = path.join(distFullPath, 'style.css');
const distHtmlFilePath = path.join(distFullPath, 'index.html');

const buildDist = async () => {
  try {
    await fsPromises.rm(distFullPath, { force: true, recursive: true });
    await fsPromises.mkdir(distFullPath, { recursive: true });
    const components = await readComponentsFromFolder(componentsFolderPath);
    const template = await readFileToString(templateFilePath);
    await buildHtmlPageFromTemplate(distHtmlFilePath, template, components);
    const styles = await readStylesFromFolder(styleFolderPath);
    await buildStyleBundle(distStyleFilePath, styles);
    copyAssetsFiles(assetsFolderName);
  } catch (error) {
    console.error(error);
  }
};

const readComponentsFromFolder = async (dir) => {
  const components = [];
  const componentFiles = await fsPromises.readdir(dir, { withFileTypes: true });
  const componentHtmlFiles = componentFiles.filter((file) => file.isFile() && path.extname(file.name) === '.html');
  for (const componentHtmlFile of componentHtmlFiles) {
    if (componentHtmlFile.isFile()) {
      const pathFile = path.join(dir, componentHtmlFile.name);
      const component = {};
      component.html = await readFileToString(pathFile);
      component.name = componentHtmlFile.name.slice(0, componentHtmlFile.name.lastIndexOf('.'));
      components.push(component);
    }
  }
  return components;
};

const readFileToString = (file) => {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(file);
    let str = '';
    readStream.on('data', (chank) => (str += chank.toString()));
    readStream.on('error', (error) => reject(new Error(error)));
    readStream.on('end', () => resolve(str));
  });
};

const buildHtmlPageFromTemplate = (path, template, components) => {
  return new Promise((resolve, reject) => {
    components.forEach((component) => {
      template = template.replace(`{{${component.name}}}`, component.html);
    });
    const writeStream = fs.createWriteStream(path);
    writeStream.write(template, (error) => {
      if (error) reject(new Error(error));
      resolve();
    });
  });
};

const readStylesFromFolder = async (dir) => {
  const stylesData = [];
  const styleFiles = await fsPromises.readdir(dir, { withFileTypes: true });
  const styleCssFiles = styleFiles.filter((file) => file.isFile() && path.extname(file.name) === '.css');
  for (const styleCssFile of styleCssFiles) {
    const pathFile = path.join(dir, styleCssFile.name);
    const data = await readFileToString(pathFile);
    stylesData.push(data);
  }
  return stylesData;
};

const buildStyleBundle = (bundlePath, stylesData) => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(bundlePath);
    for (const styledata of stylesData) {
      writeStream.write(`${styledata}\n`, (error) => reject(new Error(error)));
    }
    resolve();
  });
};

const copyAssetsFiles = (folderName) => {
  const distAssetsFolderPath = path.join(distFullPath, folderName);
  fs.mkdir(distAssetsFolderPath, (error) => {
    if (error) return new Error(error);
    copyAllFiles(folderName);
  });
};

const copyAllFiles = (dir) => {
  const fullPath = path.join(__dirname, dir);
  fs.readdir(fullPath, { withFileTypes: true }, (error, items) => {
    if (error) return new Error(error);
    items.forEach((item) => {
      if (item.isDirectory()) {
        fs.mkdir(path.join(distFullPath, dir, item.name), (error) => {
          if (error) return new Error(error);
          copyAllFiles(path.join(dir, item.name));
        });
      } else {
        fs.copyFile(path.join(fullPath, item.name), path.join(distFullPath, dir, item.name), (error) => {
          if (error) return new Error(error);
        });
      }
    });
  });
};

buildDist();
