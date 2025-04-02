#!/usr/bin/env node

/**
 * Utility script to help migrate route handlers from legacy error handling to the new API error system
 * 
 * This script scans route handler files and suggests changes to update to the new error handling system.
 * It does not make changes automatically but outputs recommendations and code samples.
 * 
 * Usage: node migrate-error-handling.js [target-directory]
 * Example: node migrate-error-handling.js ../routes
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const readline = require('readline');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Mappings between legacy error handling and new API error system
const errorMappings = {
  // Import replacements
  'import { asyncHandler, createError, notFoundError, forbiddenError } from \'../utils/error-handler\';': 
    `import { asyncHandler } from '../utils/error-handler';
import { resourceNotFoundError, forbiddenError, operationFailedError } from '../utils/api-error';`,

  // Function replacements
  'throw notFoundError(': 'throw resourceNotFoundError(',
  'throw createError("Failed to': 'throw operationFailedError(',
  'throw createError("Unauthorized': 'throw authenticationRequiredError(',
  'throw createError("Forbidden': 'throw forbiddenError(',
  'throw createError("Invalid': 'throw validationError(',
};

// Files to skip
const skipFiles = [
  'error-handler.ts',
  'api-error.ts',
  'api-error-migration.ts'
];

async function scanFile(filePath) {
  try {
    // Skip non-TypeScript files
    if (!filePath.endsWith('.ts')) {
      return null;
    }
    
    // Skip specified files
    const fileName = path.basename(filePath);
    if (skipFiles.includes(fileName)) {
      return null;
    }
    
    const content = await readFile(filePath, 'utf8');
    
    let recommendations = [];
    let lineNumber = 1;
    
    // Scan the file line by line
    for (const line of content.split('\n')) {
      for (const [oldPattern, newPattern] of Object.entries(errorMappings)) {
        if (line.includes(oldPattern)) {
          recommendations.push({
            file: filePath,
            line: lineNumber,
            oldCode: line.trim(),
            newCode: line.replace(oldPattern, newPattern).trim(),
            pattern: oldPattern
          });
        }
      }
      lineNumber++;
    }
    
    return recommendations.length > 0 ? recommendations : null;
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return null;
  }
}

async function scanDirectory(directoryPath) {
  try {
    const entries = await readdir(directoryPath);
    
    let allRecommendations = [];
    
    for (const entry of entries) {
      const entryPath = path.join(directoryPath, entry);
      const entryStat = await stat(entryPath);
      
      if (entryStat.isDirectory()) {
        const subDirRecommendations = await scanDirectory(entryPath);
        allRecommendations = [...allRecommendations, ...subDirRecommendations];
      } else {
        const fileRecommendations = await scanFile(entryPath);
        if (fileRecommendations) {
          allRecommendations = [...allRecommendations, ...fileRecommendations];
        }
      }
    }
    
    return allRecommendations;
  } catch (error) {
    console.error(`Error scanning directory ${directoryPath}:`, error);
    return [];
  }
}

function displayRecommendations(recommendations) {
  if (recommendations.length === 0) {
    console.log('No recommendations found. All files are already using the new error system or no matching files found.');
    return;
  }
  
  console.log(`\n🔍 Found ${recommendations.length} potential updates in ${new Set(recommendations.map(r => r.file)).size} files:\n`);
  
  // Group recommendations by file
  const fileGroups = {};
  for (const rec of recommendations) {
    if (!fileGroups[rec.file]) {
      fileGroups[rec.file] = [];
    }
    fileGroups[rec.file].push(rec);
  }
  
  // Display recommendations by file
  for (const [file, recs] of Object.entries(fileGroups)) {
    console.log(`\n📄 ${file}:`);
    
    for (const rec of recs) {
      console.log(`  Line ${rec.line}:`);
      console.log(`    - Old: ${rec.oldCode}`);
      console.log(`    + New: ${rec.newCode}`);
      console.log();
    }
  }
  
  console.log('\n📚 Please refer to server/docs/error-handling-guide.md for more information on the new error handling system.');
}

// Main function
async function main() {
  const targetDir = process.argv[2] || path.join(__dirname, '..', 'routes');
  
  console.log(`\n🔍 Scanning directory: ${targetDir}\n`);
  
  try {
    const recommendations = await scanDirectory(targetDir);
    displayRecommendations(recommendations);
  } catch (error) {
    console.error('Error during scanning:', error);
    process.exit(1);
  }
}

// Run the script
main(); 