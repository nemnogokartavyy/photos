import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function printTree(dirPath, prefix = '', level = 0, maxLevel = 5, ignoreDirs = []) {
  if (level > maxLevel) return;

  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  const filteredItems = items.filter(item => !(item.isDirectory() && ignoreDirs.includes(item.name)));
  const lastIndex = filteredItems.length - 1;

  filteredItems.forEach((item, index) => {
    const isLast = index === lastIndex;
    const pointer = isLast ? '└── ' : '├── ';
    console.log(prefix + pointer + item.name);

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      printTree(path.join(dirPath, item.name), newPrefix, level + 1, maxLevel, ignoreDirs);
    }
  });
}

const projectPath = process.argv[2] || __dirname;

const ignoreFolders = ['node_modules', '.next', '.git'];

console.log(projectPath);
printTree(projectPath, '', 0, 5, ignoreFolders);
