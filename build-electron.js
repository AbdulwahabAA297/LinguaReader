import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Determine OS-specific build command
let buildCommand = 'electron-builder';
if (process.platform === 'win32') {
  buildCommand += ' --windows';
} else if (process.platform === 'darwin') {
  buildCommand += ' --mac';
} else {
  buildCommand += ' --linux';
}

console.log('Building the React application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Creating SQLite schema files...');
// Create directory for SQLite schema files if it doesn't exist
const schemaDirPath = path.join(process.cwd(), 'dist', 'schemas');
if (!fs.existsSync(schemaDirPath)) {
  fs.mkdirSync(schemaDirPath, { recursive: true });
}

// Copy schema files to the dist directory for packaging
const sourceSchema = path.join(process.cwd(), 'server', 'db-sqlite.ts');
const targetSchema = path.join(schemaDirPath, 'db-sqlite.js');
fs.copyFileSync(sourceSchema, targetSchema);

console.log('Packaging the Electron application...');
execSync(buildCommand, { stdio: 'inherit' });

console.log('Build completed. Find your application in the release folder.');