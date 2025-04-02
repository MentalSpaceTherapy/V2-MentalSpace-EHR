#!/bin/bash

# Install Material UI dependencies
npm install @mui/material @mui/icons-material @mui/lab @mui/system @mui/x-data-grid @mui/x-date-pickers
npm install @emotion/react @emotion/styled

# Install React Router
npm install react-router-dom

# Install other dependencies
npm install axios-cache-interceptor date-fns

# Install dev dependencies
npm install -D @types/react-router-dom

# Create necessary directories
mkdir -p src/types
mkdir -p src/components/clients/client-forms
mkdir -p src/components/clients/tabs
mkdir -p src/lib

# Print completion message
echo "Dependencies installed successfully!"
echo "Run 'npm run dev' to start the development server." 