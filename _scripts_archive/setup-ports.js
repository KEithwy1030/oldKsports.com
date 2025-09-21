#!/usr/bin/env node

/**
 * Port Configuration Setup Script
 * This script sets up dynamic port configuration for the frontend and backend
 * by reading from .env file and creating/updating necessary configuration.
 */

import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const currentYear = new Date().getFullYear();

console.log(`🚀 Starting port setup for [${currentYear}]`);

try {
  // Read .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log(`✅ Found .env file at: ${envPath}`);
  } else {
    console.log(`⚠️  .env file not found at: ${envPath}`);
  }

  // Update FRONTEND_URL and VITE_FRONTEND_URL to use FRONTEND_PORT
  const frontendPort = envContent.match(/^FRONTEND_PORT=(\d+)$/m)?.[1] || '5173';
  
  // Update FRONTEND_URL to use the dynamic port
  const frontendUrlPattern = /^FRONTEND_URL=http:\/\/localhost:\d+$/gm;
  if (frontendUrlPattern.test(envContent)) {
    envContent = envContent.replace(frontendUrlPattern, `FRONTEND_URL=http://localhost:${frontendPort}`);
    console.log(`📱 Updated FRONTEND_URL to use port ${frontendPort}`);
  } else {
    // Add if not exists
    if (!envContent.includes('FRONTEND_URL=')) {
      envContent += `\nFRONTEND_URL=http://localhost:${frontendPort}\n`;
      console.log(`📱 Added FRONTEND_URL with port ${frontendPort}`);
    }
  }

  // Update VITE_FRONTEND_URL to use the dynamic port
  const viteFrontendUrlPattern = /^VITE_FRONTEND_URL=http:\/\/localhost:\d+$/gm;
  if (viteFrontendUrlPattern.test(envContent)) {
    envContent = envContent.replace(viteFrontendUrlPattern, `VITE_FRONTEND_URL=http://localhost:${frontendPort}`);
    console.log(`🎨 Updated VITE_FRONTEND_URL to use port ${frontendPort}`);
  } else {
    // Add if not exists
    if (!envContent.includes('VITE_FRONTEND_URL=')) {
      envContent += `\nVITE_FRONTEND_URL=http://localhost:${frontendPort}\n`;
      console.log(`🎨 Added VITE_FRONTEND_URL with port ${frontendPort}`);
    }
  }

  // Update VITE_API_URL to use BACKEND_PORT
  const backendPort = envContent.match(/^BACKEND_PORT=(\d+)$/m)?.[1] || '3001';
  const apiUrlPattern = /^VITE_API_URL=http:\/\/localhost:\d+\/api$/gm;
  if (apiUrlPattern.test(envContent)) {
    envContent = envContent.replace(apiUrlPattern, `VITE_API_URL=http://localhost:${backendPort}/api`);
    console.log(`🔗 Updated VITE_API_URL to use port ${backendPort}`);
  } else {
    // Add if not exists
    if (!envContent.includes('VITE_API_URL=')) {
      envContent += `\nVITE_API_URL=http://localhost:${backendPort}/api\n`;
      console.log(`🔗 Added VITE_API_URL with port ${backendPort}`);
    }
  }

  // Write updated .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
  console.log(`✅ Updated .env file with port configuration`);

  // Display configuration summary
  console.log('\n📋 Configuration Summary:');
  console.log(`   Backend Port: ${backendPort}`);
  console.log(`   Frontend Port: ${frontendPort}`);
  console.log(`   API URL: http://localhost:${backendPort}/api`);
  console.log(`   Frontend URL: http://localhost:${frontendPort}`);

  console.log('\n🎯 Next steps:');
  console.log(`   1. Run "npm run dev" to start the frontend on port ${frontendPort}`);
  console.log(`   2. Run "npm run dev:server" to start the backend on port ${backendPort}`);
  console.log(`   3. Run "npm run dev:all" to start both servers simultaneously`);

} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
}

console.log(`\n✨ Port setup completed for [${currentYear}]`);