const fs = require('fs');
const path = require('path');

const sourceFolderPath = path.join(__dirname, './files');
const destFolderPath = path.join(__dirname, './files-copy');

fs.stat(destFolderPath, (err) => {
  if (err) {
    fs.mkdir(destFolderPath, (error) => {
      if (error) {
        return process.stdout.write(`Folder creation error: ${error}. Module is stopped\n`);
      }
      process.stdout.write(`The folder "${destFolderPath}" was created.\n`);
      updateDestFolder();
    });
  } else updateDestFolder();
});

const updateDestFolder = () => {
  fs.readdir(sourceFolderPath, { withFileTypes: true }, (error, data) => {
    if (error) {
      return process.stdout.write(`The source folder has an error: ${error}. Module is stopped\n`);
    }
    const sourseFiles = data;
    fs.readdir(destFolderPath, { withFileTypes: true }, (error, data) => {
      const destFiles = data;
      destFiles.forEach((destFile) => {
        // Удаляем файлы, что есть в папке назначения, но нет в исходной папке
        if (!sourseFiles.find((sorceFile) => sorceFile.name === destFile.name)) {
          fs.unlink(path.join(destFolderPath, destFile.name), (err) => {
            if (err) {
              return process.stdout.write(`File deletion error: ${err}\n`);
            }
            process.stdout.write(`The file "${destFile.name}" \t was deleted.\n`);
          });
        }
      });
      sourseFiles.forEach((sourceFile) => {
        // Копируем из исходной папки файл, если его нет в папке назначения
        if (!destFiles.find((destFile) => sourceFile.name === destFile.name)) {
          const sourceFilePath = path.join(sourceFolderPath, sourceFile.name);
          const destFilePath = path.join(destFolderPath, sourceFile.name);
          fs.copyFile(sourceFilePath, destFilePath, (err) => {
            if (err) {
              return process.stdout.write(`File copying error: ${err}\n`);
            }
            process.stdout.write(`The file "${sourceFile.name}"   \t was copied.\n`);
          });
        }
      });
    });
  });
};
