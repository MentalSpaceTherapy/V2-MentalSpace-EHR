import ghpages from 'gh-pages';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure deployment options
const options = {
  branch: 'gh-pages',
  repo: 'https://github.com/MentalSpaceTherapy/V2-MentalSpace-EHR.git',
  message: 'Fresh deployment with cache busting [ci skip]',
  dotfiles: true,
  add: true  // Add this to force all files to be redeployed
};

// Get the directory path for the dist folder
const distPath = join(__dirname, 'dist');

// Start deployment
console.log('Starting deployment to GitHub Pages...');
ghpages.publish(distPath, options, (err) => {
  if (err) {
    console.error('Deployment error:', err);
    process.exit(1);
  } else {
    console.log('Successfully deployed to GitHub Pages!');
    console.log('Visit: https://mentalspacetherapy.github.io/V2-MentalSpace-EHR/');
  }
}); 