#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Deepfake Detection API Setup\n');
console.log('This script will help you configure your API credentials for accurate deepfake detection.\n');

const envPath = path.join(__dirname, '.env');
let envContent = '';

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('📁 Found existing .env file');
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('📁 Creating new .env file');
}

// Function to get user input
function askQuestion(question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Function to update or add environment variable
function updateEnvVar(key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, newLine);
  } else {
    envContent += (envContent.endsWith('\n') || envContent === '' ? '' : '\n') + newLine + '\n';
  }
}

async function setupAPI() {
  console.log('\n🌐 Sightengine API Setup');
  console.log('Visit: https://sightengine.com/');
  console.log('1. Sign up for an account');
  console.log('2. Navigate to your dashboard');
  console.log('3. Copy your User ID and Secret\n');
  
  const sightengineUser = await askQuestion('Enter your Sightengine User ID: ');
  const sightengineSecret = await askQuestion('Enter your Sightengine Secret: ');
  
  if (sightengineUser && sightengineSecret) {
    updateEnvVar('SIGHTENGINE_USER', sightengineUser);
    updateEnvVar('SIGHTENGINE_SECRET', sightengineSecret);
    console.log('✅ Sightengine credentials configured');
  } else {
    console.log('⚠️  Sightengine credentials skipped');
  }
  
  console.log('\n🎵 Resemble AI Detect API Setup');
  console.log('Visit: https://www.resemble.ai/detect/');
  console.log('1. Sign up for an account');
  console.log('2. Navigate to your API section');
  console.log('3. Generate and copy your API key\n');
  
  const resembleApiKey = await askQuestion('Enter your Resemble AI API key: ');
  
  if (resembleApiKey) {
    updateEnvVar('RESEMBLE_API_KEY', resembleApiKey);
    console.log('✅ Resemble AI credentials configured');
  } else {
    console.log('⚠️  Resemble AI credentials skipped');
  }
  
  // Write the .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n🎉 Setup complete!');
  console.log(`📁 Environment variables saved to: ${envPath}`);
  console.log('\n🚀 To start the development server:');
  console.log('   pnpm dev');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your development server');
  console.log('2. Upload test images to verify API integration');
  console.log('3. Check the console for API status messages');
  
  rl.close();
}

setupAPI().catch(console.error);
