#!/usr/bin/env node

/**
 * Deployment script for Supabase Edge Functions
 * Run with: node deploy-functions.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 InterviewCoach Video Conversion Setup\n');

// Check if Supabase CLI is installed
try {
  execSync('supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is installed');
} catch (error) {
  console.log('❌ Supabase CLI is not installed');
  console.log('Install it with: npm install -g supabase');
  process.exit(1);
}

// Check if functions directory exists
const functionsDir = path.join(__dirname, 'supabase', 'functions');
if (!fs.existsSync(functionsDir)) {
  console.log('❌ Supabase functions directory not found');
  process.exit(1);
}

// Check if video-conversion function exists
const videoFunctionDir = path.join(functionsDir, 'video-conversion');
if (!fs.existsSync(videoFunctionDir)) {
  console.log('❌ Video conversion function not found');
  process.exit(1);
}

console.log('📁 Found video-conversion function');

// Check if user is logged in to Supabase
try {
  execSync('supabase projects list', { stdio: 'pipe' });
  console.log('✅ User is logged in to Supabase');
} catch (error) {
  console.log('❌ User is not logged in to Supabase');
  console.log('Login with: supabase login');
  process.exit(1);
}

// Get linked project
let linkedProject = '';
try {
  const output = execSync('supabase status', { encoding: 'utf8', stdio: 'pipe' });
  const match = output.match(/Linked to: (.+)/);
  if (match) {
    linkedProject = match[1].trim();
    console.log(`✅ Linked to project: ${linkedProject}`);
  }
} catch (error) {
  console.log('❌ No linked Supabase project found');
  console.log('Link your project with: supabase link --project-ref YOUR_PROJECT_REF');
  process.exit(1);
}

// Deploy the function
console.log('\n🔄 Deploying video-conversion function...');
try {
  execSync('supabase functions deploy video-conversion', { stdio: 'inherit' });
  console.log('✅ Video conversion function deployed successfully!');
} catch (error) {
  console.log('❌ Failed to deploy function');
  console.log('Check the error messages above');
  process.exit(1);
}

// Update schema.sql with project reference
console.log('\n📝 Updating schema.sql with project reference...');
const schemaPath = path.join(__dirname, 'backend', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const projectRef = linkedProject.split('/').pop(); // Extract project ref from URL
  schemaContent = schemaContent.replace(
    /https:\/\/your-project-ref\.supabase\.co/g,
    `https://${projectRef}.supabase.co`
  );
  fs.writeFileSync(schemaPath, schemaContent);
  console.log('✅ Schema updated with project reference');
} else {
  console.log('⚠️  schema.sql not found - update manually');
}

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Run the schema.sql in your Supabase SQL Editor');
console.log('2. Test video upload through your application');
console.log('3. Check conversion status in the dashboard');
console.log('\n📚 See VIDEO_CONVERSION_SETUP.md for detailed instructions');
