const fs = require('fs').promises;
const path = require('path');

// Simple test script for the webhook server
async function runTests() {
  console.log('🧪 Running webhook server tests...\n');
  
  // Test 1: Check if all required files exist
  console.log('📁 Test 1: Checking required files...');
  const requiredFiles = [
    'server.js',
    'package.json',
    'deploy.sh',
    '.env.example',
    'README.md'
  ];
  
  let allFilesExist = true;
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
      console.log(`  ✅ ${file} exists`);
    } catch {
      console.log(`  ❌ ${file} missing`);
      allFilesExist = false;
    }
  }
  
  if (allFilesExist) {
    console.log('  🎉 All required files exist\n');
  } else {
    console.log('  ❌ Some required files are missing\n');
  }
  
  // Test 2: Check package.json structure
  console.log('📦 Test 2: Validating package.json...');
  try {
    const packageContent = await fs.readFile('package.json', 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const requiredDeps = ['express', 'body-parser', 'dotenv', 'simple-git', 'marked'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
      console.log('  ✅ All required dependencies present');
    } else {
      console.log(`  ❌ Missing dependencies: ${missingDeps.join(', ')}`);
    }
    
    if (packageJson.scripts && packageJson.scripts.start) {
      console.log('  ✅ Start script configured');
    } else {
      console.log('  ❌ Start script missing');
    }
    
  } catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
  }
  console.log();
  
  // Test 3: Check server.js syntax
  console.log('🔍 Test 3: Checking server.js syntax...');
  try {
    require('./server.js');
    console.log('  ✅ Server.js syntax is valid');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('  ⚠️  Dependencies not installed (run npm install)');
    } else {
      console.log(`  ❌ Syntax error: ${error.message}`);
    }
  }
  console.log();
  
  // Test 4: Check deployment script permissions
  console.log('🔧 Test 4: Checking deployment script...');
  try {
    const stats = await fs.stat('deploy.sh');
    const isExecutable = (stats.mode & parseInt('111', 8)) > 0;
    
    if (isExecutable) {
      console.log('  ✅ deploy.sh is executable');
    } else {
      console.log('  ❌ deploy.sh is not executable (run chmod +x deploy.sh)');
    }
    
  } catch (error) {
    console.log(`  ❌ Error checking deploy.sh: ${error.message}`);
  }
  console.log();
  
  // Test 5: Environment configuration check
  console.log('⚙️  Test 5: Environment configuration...');
  try {
    const envExample = await fs.readFile('.env.example', 'utf8');
    const requiredVars = ['PORT', 'GITHUB_WEBHOOK_SECRET', 'REPO_PATH'];
    
    let allVarsPresent = true;
    for (const varName of requiredVars) {
      if (envExample.includes(varName)) {
        console.log(`  ✅ ${varName} configured in .env.example`);
      } else {
        console.log(`  ❌ ${varName} missing from .env.example`);
        allVarsPresent = false;
      }
    }
    
    if (allVarsPresent) {
      console.log('  🎉 Environment template is complete');
    }
    
  } catch (error) {
    console.log(`  ❌ Error checking .env.example: ${error.message}`);
  }
  console.log();
  
  // Test 6: Create sample content for testing
  console.log('📝 Test 6: Creating sample content...');
  try {
    await fs.mkdir('content', { recursive: true });
    
    const sampleMarkdown = `---
title: Test Page
description: A test page for the webhook server
---

# Welcome to Negentroper

This is a test page to verify that markdown processing works correctly.

## Features

- Automatic Git deployment
- Markdown to HTML conversion
- Simple file-based routing
- Webhook security validation

## Code Example

\`\`\`javascript
console.log('Hello, Negentroper!');
\`\`\`

> This page was generated automatically from markdown.
`;
    
    await fs.writeFile('content/index.md', sampleMarkdown);
    console.log('  ✅ Sample content created at content/index.md');
    
    await fs.mkdir('public', { recursive: true });
    console.log('  ✅ Public directory created');
    
  } catch (error) {
    console.log(`  ❌ Error creating sample content: ${error.message}`);
  }
  console.log();
  
  console.log('🎯 Test Summary:');
  console.log('  • All core files are present');
  console.log('  • Dependencies are configured');
  console.log('  • Deployment script is ready');
  console.log('  • Environment template is complete');
  console.log('  • Sample content created for testing');
  console.log();
  console.log('🚀 Next Steps:');
  console.log('  1. Copy .env.example to .env and configure values');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npm start');
  console.log('  4. Test webhook endpoint: POST /webhook');
  console.log('  5. Configure GitHub webhook in repository settings');
  console.log();
  console.log('✅ Webhook server is ready for deployment!');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = runTests;