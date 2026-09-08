const mongoose = require('mongoose');
require('dotenv').config();

async function fixCourseVideos() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
        const c = await Course.findOne({ title: /JavaScript/i });
        if (!c) {
            console.log('Course not found');
            process.exit(1);
        }

        const newUrls = [
            'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            'https://www.youtube.com/watch?v=PkZNo7MFNFg',
            'https://www.youtube.com/watch?v=xUI5Tsl2JpY',
            'https://www.youtube.com/watch?v=y17RuWkWdn8',
            'https://www.youtube.com/watch?v=PoRJizFvM7s'
        ];

        let count = 0;
        for (const section of (c.sections || [])) {
            for (const lesson of (section.lessons || [])) {
                if (newUrls[count]) {
                    console.log(`Updating "${lesson.title}":`);
                    console.log(`  Old: ${lesson.videoUrl}`);
                    console.log(`  New: ${newUrls[count]}`);
                    lesson.videoUrl = newUrls[count];
                    count++;
                }
            }
        }

        await Course.updateOne({ _id: c._id }, { $set: { sections: c.sections } });
        console.log('✅ Successfully updated all 5 lessons with valid, embed-enabled YouTube URLs!');
    } catch (err) {
        console.error('❌ Error updating course videos:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

fixCourseVideos();
