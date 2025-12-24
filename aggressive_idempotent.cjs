const fs = require('fs');
const path = require('path');
const migrationsDir = path.join(__dirname, 'migrations');

const processFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Better regex to match await queryInterface.XXXX(...) across multiple lines
    // This is hard with regex, so we'll do a simpler replacement for common patterns
    
    const methods = ['addIndex', 'addColumn', 'createTable', 'createSchema', 'addConstraint'];
    
    methods.forEach(method => {
        const regex = new RegExp(`await queryInterface\\.${method}\\(`, 'g');
        content = content.replace(regex, `try { await queryInterface.${method}(`);
        
        // This is tricky because we need to find the matching closing );
        // We'll use a pragmatic approach: find the next ); and insert } catch...
    });
    
    // Split by 'try { await queryInterface' and fix each block
    const parts = content.split('try { await queryInterface.');
    if (parts.length > 1) {
        let newContent = parts[0];
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            // Find the first SC (semi-colon) after the method call.
            // This assumes the command ends with ); 
            const endIdx = part.indexOf(');');
            if (endIdx !== -1) {
                const call = part.substring(0, endIdx + 2);
                const rest = part.substring(endIdx + 2);
                newContent += `try { await queryInterface.${call} } catch (e) { if (!e.message.includes('already exists') && !e.message.includes('already exist')) throw e; }${rest}`;
            } else {
                newContent += `try { await queryInterface.${part}`;
            }
        }
        content = newContent;
    }
    
    fs.writeFileSync(filePath, content);
};

fs.readdirSync(migrationsDir).forEach(file => {
    if (file.endsWith('.cjs')) {
        console.log(`Processing ${file}`);
        processFile(path.join(migrationsDir, file));
    }
});
