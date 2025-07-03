const fs = require('fs');
const path = require('path');

function renameJsFiles(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      renameJsFiles(fullPath);
    } else if (item.endsWith('.js')) {
      const newPath = fullPath.replace('.js', '.txt');
      fs.renameSync(fullPath, newPath);
      console.log(`Renamed: ${fullPath} -> ${newPath}`);
    }
  });
}

function updateHtmlFiles(dir) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      updateHtmlFiles(fullPath);
    } else if (item.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Replace .js references with .txt
      content = content.replace(/\.js"/g, '.txt"');
      content = content.replace(/\.js'/g, ".txt'");
      
      // Add service worker registration
      const swScript = `
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
</script>`;
      
      content = content.replace('</head>', swScript + '</head>');
      
      fs.writeFileSync(fullPath, content);
      console.log(`Updated HTML: ${fullPath}`);
    }
  });
}

console.log('Renaming .js files to .txt...');
renameJsFiles('./out/_next');

console.log('Updating HTML files...');
updateHtmlFiles('./out');

console.log('Done!'); 