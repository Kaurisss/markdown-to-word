#!/usr/bin/env node
/**
 * Build script for Python backend executable
 * 
 * This script:
 * 1. Runs PyInstaller to build the Python backend
 * 2. Copies the output to src-tauri/binaries/ with correct platform naming
 * 
 * Requirements: 4.1, 4.2
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, unlinkSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Determine platform-specific naming
function getTargetName() {
  const platform = process.platform;
  const arch = process.arch === 'x64' ? 'x86_64' : process.arch;
  
  switch (platform) {
    case 'win32':
      return `md2word-${arch}-pc-windows-msvc.exe`;
    case 'darwin':
      return `md2word-${arch}-apple-darwin`;
    case 'linux':
      return `md2word-${arch}-unknown-linux-gnu`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function getSourceName() {
  return process.platform === 'win32' ? 'md2word.exe' : 'md2word';
}

function main() {
  console.log('Building Python backend executable...');
  
  const binariesDir = join(rootDir, 'src-tauri', 'binaries');
  const distDir = join(rootDir, 'dist');
  const specFile = join(rootDir, 'md2word.spec');
  
  // Ensure binaries directory exists
  if (!existsSync(binariesDir)) {
    mkdirSync(binariesDir, { recursive: true });
    console.log('Created binaries directory');
  }
  
  // Run PyInstaller
  console.log('Running PyInstaller...');
  try {
    execSync(`pyinstaller --clean --noconfirm "${specFile}"`, {
      cwd: rootDir,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('PyInstaller build failed:', error.message);
    process.exit(1);
  }
  
  // Copy the built executable to binaries directory
  const sourceName = getSourceName();
  const targetName = getTargetName();
  const sourcePath = join(distDir, sourceName);
  const targetPath = join(binariesDir, targetName);
  
  if (!existsSync(sourcePath)) {
    console.error(`Built executable not found at: ${sourcePath}`);
    process.exit(1);
  }
  
  // Remove existing target if it exists
  if (existsSync(targetPath)) {
    unlinkSync(targetPath);
    console.log(`Removed existing: ${targetName}`);
  }
  
  copyFileSync(sourcePath, targetPath);
  console.log(`Copied ${sourceName} to ${targetName}`);
  
  // Clean up PyInstaller build artifacts
  const buildDir = join(rootDir, 'build');
  if (existsSync(buildDir)) {
    try {
      rmSync(buildDir, { recursive: true, force: true });
      console.log('Cleaned up build directory');
    } catch (e) {
      console.warn('Could not clean build directory:', e.message);
    }
  }
  
  console.log('Python backend build complete!');
  console.log(`Output: ${targetPath}`);
}

main();
