/**
 * R2 Bucket Test Script
 * 
 * This script tests your Cloudflare R2 configuration
 * Run with: node test-r2.js
 */

require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testR2Connection() {
  console.log('\n🔍 Testing R2 Configuration...\n');

  // Check environment variables
  const R2_ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'look-i-tried';
  const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  console.log('📋 Environment Variables:');
  console.log(`   CLOUDFLARE_R2_ACCOUNT_ID: ${R2_ACCOUNT_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLOUDFLARE_R2_ACCESS_KEY_ID: ${R2_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLOUDFLARE_R2_SECRET_ACCESS_KEY: ${R2_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`   CLOUDFLARE_R2_BUCKET_NAME: ${R2_BUCKET_NAME}`);
  console.log(`   CLOUDFLARE_R2_PUBLIC_URL: ${R2_PUBLIC_URL || '❌ Not set (using default)'}\n`);

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('❌ ERROR: Missing required R2 credentials in .env.local\n');
    console.log('Add these to your .env.local file:');
    console.log('CLOUDFLARE_R2_ACCOUNT_ID=your_account_id');
    console.log('CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key');
    console.log('CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key');
    console.log('CLOUDFLARE_R2_BUCKET_NAME=look-i-tried');
    console.log('CLOUDFLARE_R2_PUBLIC_URL=https://pub-your_account_id.r2.dev\n');
    process.exit(1);
  }

  try {
    // Initialize S3 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });

    console.log('🔌 Connecting to R2...');
    console.log(`   Endpoint: https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com\n`);

    // Test connection by listing buckets
    console.log('📦 Listing buckets...');
    try {
      const listBucketsCommand = new ListBucketsCommand({});
      const buckets = await s3Client.send(listBucketsCommand);
      
      if (buckets.Buckets && buckets.Buckets.length > 0) {
        console.log('✅ Connection successful! Found buckets:');
        buckets.Buckets.forEach(bucket => {
          const isTarget = bucket.Name === R2_BUCKET_NAME;
          console.log(`   ${isTarget ? '✅' : '  '} ${bucket.Name}${isTarget ? ' (target bucket)' : ''}`);
        });
        
        const targetBucketExists = buckets.Buckets.some(b => b.Name === R2_BUCKET_NAME);
        if (!targetBucketExists) {
          console.log(`\n⚠️  WARNING: Target bucket "${R2_BUCKET_NAME}" not found!`);
          console.log('   Create this bucket in Cloudflare R2 dashboard.\n');
        }
      } else {
        console.log('⚠️  No buckets found. Create one in Cloudflare R2 dashboard.\n');
      }
    } catch (error) {
      console.error('❌ Failed to list buckets:', error.message);
      throw error;
    }

    // Test upload
    console.log('\n📤 Testing file upload...');
    const testData = Buffer.from('test-image-data');
    const testKey = `test/${Date.now()}.txt`;

    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: testKey,
      Body: testData,
      ContentType: 'text/plain',
    });

    await s3Client.send(uploadCommand);
    console.log(`✅ Upload successful!`);
    console.log(`   Key: ${testKey}`);

    // Show public URL
    const publicUrl = R2_PUBLIC_URL 
      ? `${R2_PUBLIC_URL}/${testKey}`
      : `https://pub-${R2_ACCOUNT_ID}.r2.dev/${testKey}`;
    
    console.log(`   Public URL: ${publicUrl}\n`);

    // Check if public access is configured
    console.log('🌐 Checking public access...');
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log('✅ Public access is configured correctly!');
        console.log('   Your R2 bucket is publicly accessible.\n');
      } else {
        console.log('⚠️  Public access returned status:', response.status);
        if (response.status === 404) {
          console.log('   This might be normal - the file may not be accessible yet.');
        } else if (response.status === 403) {
          console.log('   ❌ Public access is NOT configured!');
          console.log('   Enable "Public Access" in your R2 bucket settings.');
        }
        console.log();
      }
    } catch (error) {
      console.log('⚠️  Could not check public access:', error.message);
      console.log('   Make sure public access is enabled in R2 bucket settings.\n');
    }

    console.log('✅ All tests passed!');
    console.log('\n📝 Summary:');
    console.log('   - R2 credentials are valid');
    console.log('   - Connection to R2 successful');
    console.log('   - File upload works');
    console.log('   - Next: Enable public access if needed\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.Code === 'InvalidAccessKeyId') {
      console.log('\n💡 Your access key is invalid. Double-check:');
      console.log('   - CLOUDFLARE_R2_ACCESS_KEY_ID');
    } else if (error.Code === 'SignatureDoesNotMatch') {
      console.log('\n💡 Your secret key is invalid. Double-check:');
      console.log('   - CLOUDFLARE_R2_SECRET_ACCESS_KEY');
    } else if (error.Code === 'NoSuchBucket') {
      console.log(`\n💡 Bucket "${R2_BUCKET_NAME}" does not exist.`);
      console.log('   Create it in Cloudflare R2 dashboard.');
    } else {
      console.log('\n💡 Full error:', error);
    }
    
    console.log('\n📖 See R2_SETUP.md for detailed setup instructions.\n');
    process.exit(1);
  }
}

// Run the test
testR2Connection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

