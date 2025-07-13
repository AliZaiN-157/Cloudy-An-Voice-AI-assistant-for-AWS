#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Setting up Cloudy WebRTC Server...\n');

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) {
  console.log('🔧 Creating .env file...');
  const envContent = `# Google Gemini API Key
API_KEY=your_google_gemini_api_key_here

# Client URL (React app)
CLIENT_URL=http://localhost:5173

# Server Port
PORT=3001
`;
  
  writeFileSync(envPath, envContent);
  console.log('✅ .env file created!');
  console.log('⚠️  Please update the API_KEY in .env with your Google Gemini API key\n');
} else {
  console.log('✅ .env file already exists\n');
}

console.log('🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update the API_KEY in .env with your Google Gemini API key');
console.log('2. Start the server with: npm start');
console.log('3. Start the client with: npm run dev (from the parent directory)');
console.log('\nFor development, you can run: npm run dev'); 