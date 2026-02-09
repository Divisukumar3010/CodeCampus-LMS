const path = require('path');
const mongoose = require('mongoose');
const { Readable } = require('stream');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Course = require('../models/Course');

// Test 1: Check database for resources
async function checkDatabase() {
    console.log('\n=== TEST 1: Check database for resources ===');
    const courses = await Course.find({}).select('title sections');
    for (const course of courses) {
        console.log(`\nCourse: "${course.title}"`);
        for (const section of course.sections) {
            for (const lesson of section.lessons) {
                const resCount = lesson.resources?.length || 0;
                if (resCount > 0) {
                    console.log(`  Lesson "${lesson.title}": ${resCount} resources`);
                    lesson.resources.forEach(r => {
                        console.log(`    - title: "${r.title}", url: "${r.url}", type: "${r.type}"`);
                    });
                } else {
                    console.log(`  Lesson "${lesson.title}": NO resources`);
                }
            }
        }
    }
}

// Test 2: Test Cloudinary raw upload
async function testCloudinaryUpload() {
    console.log('\n=== TEST 2: Test Cloudinary raw upload ===');
    const cloudinary = require('cloudinary').v2;

    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
    console.log('API key:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET');
    console.log('API secret:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        // Create a small test buffer (fake PDF header)
        const testBuffer = Buffer.from('%PDF-1.4 test content for upload diagnostic');

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'lms/test', resource_type: 'raw' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            Readable.from(testBuffer).pipe(uploadStream);
        });

        console.log('Cloudinary RAW upload SUCCESS!');
        console.log('URL:', result.secure_url);

        // Clean up test file
        await cloudinary.uploader.destroy(result.public_id, { resource_type: 'raw' });
        console.log('Test file cleaned up.');
    } catch (err) {
        console.error('Cloudinary RAW upload FAILED:', err.message);
        console.error('Full error:', JSON.stringify(err, null, 2));
    }
}

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await checkDatabase();
    await testCloudinaryUpload();

    await mongoose.disconnect();
    console.log('\nDone.');
}

run().catch(err => {
    console.error('Script failed:', err.message);
    process.exit(1);
});
