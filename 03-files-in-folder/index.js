const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, './secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (error, data) => {
  process.stdout.write('================================================== \n');
  process.stdout.write('Filename \t - \t Ext. \t - \t Size \n');
  process.stdout.write('================================================== \n');

  data.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(folderPath, file.name);
      fs.stat(filePath, (error, stats) => {
        process.stdout.write(`${file.name} \t - \t ${path.extname(file.name)} \t - \t ${(stats.size / 1024).toFixed(2)} kB\n`);
      });
    }
  });
});
