const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, './text.txt');
let writeStream = fs.createWriteStream(filePath);

process.stdout.write('Enter your data!\n');

let enteredData = '';

process.stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    writeStream.close();
    process.exit();
  }
  if (writeStream.closed) writeStream = fs.createWriteStream(filePath);
  enteredData += data;
  writeStream.write(enteredData);
  writeStream.close();
});

process.on('SIGINT', () => process.exit());

process.on('exit', () => process.stdout.write('Recording is over.'));
