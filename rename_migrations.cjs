const fs = require('fs');
const path = require('path');
const migrationsDir = path.join(__dirname, 'migrations');

fs.readdirSync(migrationsDir).forEach(file => {
    if (file.endsWith('.js')) {
        const oldPath = path.join(migrationsDir, file);
        const newPath = path.join(migrationsDir, file.replace('.js', '.cjs'));
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed ${file} to ${path.basename(newPath)}`);
    }
});
