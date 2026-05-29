const fs = require('fs');
const path = require('path');
const searchDir = 'd:/Desktop/Project/Oder/frontend/src/admin/components';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(searchDir);
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace window.confirm and confirm
  const regex = /(!?)\s*(?:window\.)?confirm\(\s*([\s\S]*?)\s*\)/g;
  
  if (regex.test(content)) {
    content = content.replace(regex, (match, bang, args) => {
      return bang + '(await confirmApp("Xác nhận", ' + args + '))';
    });
    
    // Auto import confirmApp if not imported
    if (!content.includes('confirmApp')) {
        // Find the right import path depth
        const depth = file.replace(/\\/g, '/').substring(searchDir.length).split('/').filter(x=>x).length;
        let relativePath = '../../';
        for (let i = 0; i < depth - 1; i++) {
           relativePath += '../';
        }
        const customImport = 'import { confirmApp } from "' + relativePath + 'shared/notifications/ConfirmProvider";\n';
        
        const lastImportMatch = [...content.matchAll(/^import .*$/gm)].pop();
        if (lastImportMatch) {
            const index = lastImportMatch.index + lastImportMatch[0].length;
            content = content.substring(0, index) + '\n' + customImport + content.substring(index);
        } else {
            content = customImport + content;
        }
    }
    
    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log('Updated', file);
    }
  }
});
console.log('Total files changed:', changedFiles);
