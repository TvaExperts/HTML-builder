const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, './secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (error, data) => {
  if (error) {
    console.error(new Error(error));
    return;
  }
  console.log('Filename \t - \t Ext. \t - \t Size');
  data.forEach((file) => {
    if (file.isFile()) {
      const filePath = path.join(folderPath, file.name);
      fs.stat(filePath, (error, stats) => {
        if (error) {
          console.error(new Error(error));
          return;
        }
        console.log(`${file.name} \t - \t ${path.extname(file.name)} \t - \t ${stats.size}`);
      });
    }
  });
});
