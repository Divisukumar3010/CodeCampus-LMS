/* eslint-disable no-console */
const path = require('path');
const mongoose = require('mongoose');
const ytdl = require('@distube/ytdl-core');

const Course = require('../models/Course');

// Load .env when running locally
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const args = process.argv.slice(2);
const updateAll = args.includes('--all');
const delayArg = args.find((arg) => arg.startsWith('--delay='));
const delayMs = delayArg ? Number(delayArg.split('=')[1]) : 500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldUpdateDuration = (lesson) => {
    if (updateAll) return true;
    if (lesson.videoDuration === undefined || lesson.videoDuration === null) return true;
    return Number(lesson.videoDuration) <= 0;
};

const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const getVideoDurationSeconds = async (videoUrl) => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
        throw new Error('Could not extract YouTube video ID');
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);
    const lengthSeconds = Number(info?.videoDetails?.lengthSeconds);

    if (!Number.isFinite(lengthSeconds) || lengthSeconds <= 0) {
        throw new Error('Invalid duration returned');
    }

    return lengthSeconds;
};

const connect = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI environment variable');
    }

    await mongoose.connect(uri);
};

const updateDurations = async () => {
    await connect();
    console.log('Connected to MongoDB\n');

    const courses = await Course.find({}).select('title sections totalDuration totalLessons');

    let updatedCourses = 0;
    let updatedLessons = 0;
    let skippedLessons = 0;
    let failedLessons = 0;

    for (const course of courses) {
        let courseChanged = false;

        for (const section of course.sections || []) {
            for (const lesson of section.lessons || []) {
                if (!shouldUpdateDuration(lesson)) {
                    skippedLessons += 1;
                    continue;
                }

                if (!lesson.videoUrl) {
                    failedLessons += 1;
                    console.warn(`  Missing videoUrl for: ${lesson.title} (${course.title})`);
                    continue;
                }

                try {
                    const seconds = await getVideoDurationSeconds(lesson.videoUrl);
                    lesson.videoDuration = seconds;
                    courseChanged = true;
                    updatedLessons += 1;
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    console.log(`  Updated: ${course.title} > ${lesson.title}: ${mins}m ${secs}s`);
                } catch (error) {
                    failedLessons += 1;
                    console.warn(`  Failed: ${lesson.title} (${course.title}): ${error.message}`);
                }

                if (delayMs > 0) {
                    await sleep(delayMs);
                }
            }
        }

        // Always save every course to recalculate totalDuration via pre-save hook
        const oldDuration = course.totalDuration || 0;
        course.markModified('sections');
        await course.save();
        if (courseChanged) updatedCourses += 1;
        if (oldDuration !== course.totalDuration) {
            console.log(`  Recalculated: ${course.title} (${oldDuration}s -> ${course.totalDuration}s)`);
        } else {
            console.log(`  OK: ${course.title} (totalDuration: ${course.totalDuration}s)`);
        }
    }

    console.log('\n---');
    console.log(`Courses updated: ${updatedCourses}`);
    console.log(`Courses recalculated: ${courses.length}`);
    console.log(`Lessons updated: ${updatedLessons}`);
    console.log(`Lessons skipped: ${skippedLessons}`);
    console.log(`Lessons failed: ${failedLessons}`);

    await mongoose.disconnect();
    console.log('Done');
};

updateDurations().catch((error) => {
    console.error(`Failed: ${error.message}`);
    process.exit(1);
});
