const fs = require('fs');
const path = require('path');
const migrationsDir = path.join(__dirname, 'migrations');

fs.readdirSync(migrationsDir).forEach(file => {
    if (file.endsWith('.cjs')) {
        const filePath = path.join(migrationsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        // Wrap addIndex
        if (content.includes('queryInterface.addIndex') && !content.includes('catch')) {
            console.log(`Making addIndex idempotent in ${file}`);
            content = content.replace(/await queryInterface\.addIndex\(([^)]+)\);/g, (match, args) => {
                return `try { await queryInterface.addIndex(${args}); } catch (e) { if (!e.message.includes('already exists')) throw e; }`;
            });
            changed = true;
        }

        // Wrap addColumn
        if (content.includes('queryInterface.addColumn') && !content.includes('catch')) {
             console.log(`Making addColumn idempotent in ${file}`);
             content = content.replace(/await queryInterface\.addColumn\(([^)]+)\);/g, (match, args) => {
                return `try { await queryInterface.addColumn(${args}); } catch (e) { if (!e.message.includes('already exists')) throw e; }`;
            });
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content);
        }
    }
});
console.log('Indempotency script finished.');
