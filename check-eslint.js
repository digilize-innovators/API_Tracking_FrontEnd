const { spawnSync } = require('child_process');
const path = require('path');

const maxAttempts = 3;
let attempts = 0;

function runESLint() {
    try {
        const eslintPath = path.resolve('node_modules', '.bin', 'eslint');

        const result = spawnSync(eslintPath, ['.'], {
            stdio: 'inherit',
            shell: false
        });

        if (result.status === 0) {
            console.log('ESLint passed successfully.');
            return true;
        } else {
            console.error('ESLint failed with errors.');
            return false;
        }
    } catch (error) {
        console.error('Error running ESLint:', error);
        return false;
    }
}

function fixESLint() {
    try {
        const eslintPath = path.resolve('node_modules', '.bin', 'eslint');

        const result = spawnSync(eslintPath, ['.', '--fix'], {
            stdio: 'inherit',
            shell: false
        });

        if (result.status === 0) {
            console.log('ESLint fix applied.');
        } else {
            console.error('ESLint fix failed.');
        }
    } catch (error) {
        console.error('Error fixing ESLint:', error);
    }
}

while (attempts < maxAttempts) {
    attempts += 1;
    console.log(`ESLint check attempt ${attempts}`);
    if (runESLint()) {
        process.exit(0);
    } else {
        fixESLint();
    }
}

console.error('ESLint failed after maximum attempts. Please fix the errors manually.');
process.exit(1);
