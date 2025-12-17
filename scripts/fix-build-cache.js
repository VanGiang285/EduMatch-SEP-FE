const fs = require('fs');
const path = require('path');

const NEXT_DIR = path.join(process.cwd(), '.next');

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

console.log('Cleaning Next.js build cache...');

if (fs.existsSync(NEXT_DIR)) {
  deleteDirectory(NEXT_DIR);
  console.log('✓ Cleaned .next directory');
} else {
  console.log('✓ .next directory does not exist');
}

console.log('Build cache cleaned successfully!');
console.log('Run "npm run dev" or "npm run build" to rebuild.');

