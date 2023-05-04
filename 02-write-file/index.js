const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, './text.txt');
const writeStream = fs.createWriteStream(filePath);

process.stdout.write('Enter your data!\n');

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    writeStream.close();
    process.exit();
  }
  writeStream.write(data);
});

process.on('SIGINT', () => process.exit());

process.on('exit', () => process.stdout.write('Recording is over.'));
