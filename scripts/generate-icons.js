// scripts/generate-icons.js
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_SVG = path.join(__dirname, '../client/public/icons/icon.svg');
const OUTPUT_DIR = path.join(__dirname, '../client/public/icons');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate standard icons
async function generateIcons() {
  const sizes = [192, 512];
  
  try {
    const svgBuffer = fs.readFileSync(INPUT_SVG);
    
    // Standard icons
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`));
      
      console.log(`Generated icon-${size}x${size}.png`);
    }
    
    // Maskable icon (has padding around it for safe zone)
    await sharp(svgBuffer)
      .resize(192, 192, { 
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 } // #3b82f6
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'icon-192x192-maskable.png'));
    
    console.log('Generated icon-192x192-maskable.png');
    
    // Generate favicon.ico (16x16 PNG)
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon.png'));
    
    console.log('Generated favicon.png');
    
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();