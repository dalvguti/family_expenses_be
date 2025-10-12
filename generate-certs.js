#!/usr/bin/env node

/**
 * Generate Self-Signed SSL Certificates for Development
 * 
 * This script generates self-signed SSL certificates for local HTTPS development.
 * DO NOT use these certificates in production!
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'certs');
const certFile = path.join(certsDir, 'server.crt');
const keyFile = path.join(certsDir, 'server.key');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir);
  console.log('✓ Created certs directory');
}

// Check if certificates already exist
if (fs.existsSync(certFile) && fs.existsSync(keyFile)) {
  console.log('⚠️  SSL certificates already exist:');
  console.log(`   - ${certFile}`);
  console.log(`   - ${keyFile}`);
  console.log('\nTo regenerate, delete these files first and run this script again.');
  process.exit(0);
}

console.log('Generating self-signed SSL certificates for development...\n');

try {
  // Check if openssl is available
  try {
    execSync('openssl version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ OpenSSL is not installed or not in PATH');
    console.error('\nFor Windows:');
    console.error('  - Download from: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('  - Or use Git Bash which includes OpenSSL');
    console.error('\nFor macOS:');
    console.error('  - OpenSSL should be pre-installed');
    console.error('\nFor Linux:');
    console.error('  - Run: sudo apt-get install openssl (Ubuntu/Debian)');
    console.error('  - Run: sudo yum install openssl (CentOS/RHEL)');
    process.exit(1);
  }

  // Generate private key and certificate
  const opensslCmd = `openssl req -x509 -newkey rsa:4096 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Development/OU=IT/CN=localhost"`;
  
  console.log('Running OpenSSL command...');
  execSync(opensslCmd, { stdio: 'inherit' });

  console.log('\n✓ SSL certificates generated successfully!\n');
  console.log('Certificate files:');
  console.log(`  - Certificate: ${certFile}`);
  console.log(`  - Private Key: ${keyFile}`);
  console.log('\n⚠️  WARNING: These are self-signed certificates for DEVELOPMENT ONLY!');
  console.log('   Do NOT use these certificates in production!\n');
  console.log('Next steps:');
  console.log('  1. Set USE_HTTPS=true in your .env file');
  console.log('  2. Start your server with: npm start');
  console.log('  3. Your browser will show a security warning - this is normal for self-signed certs');
  console.log('  4. Click "Advanced" and proceed to continue (development only)');

} catch (error) {
  console.error('❌ Failed to generate certificates:', error.message);
  process.exit(1);
}

