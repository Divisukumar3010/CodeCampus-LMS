const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Curated authentic educational YouTube videos for all courses
const realCourseData = {
    'JavaScript from Zero to Hero': {
        sections: [
            {
                title: 'JavaScript Fundamentals & Core Concepts',
                description: 'Core building blocks, variables, data types, and syntax rules',
                order: 1,
                lessons: [
                    {
                        title: '1. JavaScript Crash Course for Beginners',
                        description: 'What is JavaScript, syntax basics, console, variables, and data types.',
                        videoUrl: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
                        videoDuration: 6000,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: '2. Variables, Data Types & Operators',
                        description: 'Deep dive into let, const, primitive types, operators, and type coercion.',
                        videoUrl: 'https://www.youtube.com/watch?v=edlFjlzxkSI',
                        videoDuration: 1800,
                        isFree: true,
                        order: 2,
                        resources: []
                    },
                    {
                        title: '3. Functions, Scope & Arrow Functions',
                        description: 'Function declarations, expressions, arrow functions, and lexical scope.',
                        videoUrl: 'https://www.youtube.com/watch?v=N8ap4k_1QEQ',
                        videoDuration: 1500,
                        isFree: false,
                        order: 3,
                        resources: []
                    }
                ]
            },
            {
                title: 'DOM Manipulation & Modern ES6+',
                description: 'Interactive web apps with DOM events, async JavaScript, and modern features',
                order: 2,
                lessons: [
                    {
                        title: '4. JavaScript DOM Manipulation Tutorial',
                        description: 'Selecting elements, event listeners, creating and modifying nodes in real time.',
                        videoUrl: 'https://www.youtube.com/watch?v=5fb2aPlgoys',
                        videoDuration: 2400,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: '5. Asynchronous JavaScript: Promises & Async/Await',
                        description: 'Fetch API, promises, async/await syntax, and error handling.',
                        videoUrl: 'https://www.youtube.com/watch?v=spvYqO_Ks9c',
                        videoDuration: 2100,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            }
        ]
    },
    'Complete Web Development Bootcamp 2024': {
        sections: [
            {
                title: 'Full Stack & Web Foundations',
                description: 'Overview of modern full-stack web architecture with HTML, CSS, and MERN',
                order: 1,
                lessons: [
                    {
                        title: 'Full Stack Web Development in 2024 (Roadmap & Overview)',
                        description: 'Comprehensive walkthrough of front-end, back-end, APIs, and modern toolchains.',
                        videoUrl: 'https://www.youtube.com/watch?v=71Isrtou3f0',
                        videoDuration: 1200,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'HTML & Web Fundamentals',
                        description: 'Semantic HTML5 structure, elements, attributes, and modern web standards.',
                        videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
                        videoDuration: 1800,
                        isFree: true,
                        order: 2,
                        resources: []
                    }
                ]
            },
            {
                title: 'Modern CSS & Responsive Web Design',
                description: 'Styling websites with modern CSS, Flexbox, CSS Grid, and responsive principles',
                order: 2,
                lessons: [
                    {
                        title: 'CSS3 Foundations & Selectors',
                        description: 'CSS cascade, specificity, box model, colors, and layout rules.',
                        videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
                        videoDuration: 2400,
                        isFree: false,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'Flexbox & CSS Grid Mastery',
                        description: 'Building mobile-first responsive layouts with modern CSS alignment tools.',
                        videoUrl: 'https://www.youtube.com/watch?v=fYq5PXgSsbE',
                        videoDuration: 1950,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            },
            {
                title: 'Backend API Development with Node.js & Express',
                description: 'Building scalable REST APIs with Express and Node.js',
                order: 3,
                lessons: [
                    {
                        title: 'Node.js & Express Server Setup',
                        description: 'Setting up Node runtime, npm modules, routing, and middleware.',
                        videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
                        videoDuration: 3600,
                        isFree: false,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'MongoDB Database Integration & Mongoose Models',
                        description: 'Connecting to MongoDB, creating schemas, and running CRUD operations.',
                        videoUrl: 'https://www.youtube.com/watch?v=DZBGEExL2LU',
                        videoDuration: 2700,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            }
        ]
    },
    'Data Science Masterclass with Python': {
        sections: [
            {
                title: 'Python for Data Science',
                description: 'Master Python programming concepts for data analysis and scientific computing',
                order: 1,
                lessons: [
                    {
                        title: 'Python for Beginners - Full Crash Course',
                        description: 'Python syntax, data types, lists, dictionaries, functions, and modules for data science.',
                        videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
                        videoDuration: 3600,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'NumPy Tutorial: Data Manipulation with Arrays',
                        description: 'Array operations, indexing, vectorization, and mathematical functions.',
                        videoUrl: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
                        videoDuration: 3500,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            },
            {
                title: 'Data Analysis & Visualization with Pandas & Matplotlib',
                description: 'Exploratory data analysis and visualization pipelines',
                order: 2,
                lessons: [
                    {
                        title: 'Pandas Masterclass: DataFrames & Series',
                        description: 'Loading CSVs, cleaning missing values, grouping, filtering, and aggregation.',
                        videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
                        videoDuration: 3600,
                        isFree: false,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'Data Visualization with Matplotlib & Seaborn',
                        description: 'Creating publication-ready charts, histograms, heatmaps, and scatter plots.',
                        videoUrl: 'https://www.youtube.com/watch?v=UO98lJQ3QGI',
                        videoDuration: 2400,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            }
        ]
    },
    'React Native - Build Mobile Apps': {
        sections: [
            {
                title: 'React Native & Mobile Architecture',
                description: 'Set up cross-platform mobile apps for iOS and Android',
                order: 1,
                lessons: [
                    {
                        title: 'React Native Crash Course & Expo Setup',
                        description: 'Setting up Expo, simulator workflow, and core mobile components.',
                        videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
                        videoDuration: 4200,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'Navigation & State Management in Mobile',
                        description: 'React Navigation, stack & tab navigators, passing parameters, and device state.',
                        videoUrl: 'https://www.youtube.com/watch?v=mJ3bGvy0WAY',
                        videoDuration: 3100,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            }
        ]
    },
    'Machine Learning A-Z': {
        sections: [
            {
                title: 'Machine Learning Fundamentals',
                description: 'Core concepts of supervised and unsupervised learning',
                order: 1,
                lessons: [
                    {
                        title: 'Machine Learning Course for Beginners',
                        description: 'What is ML, supervised vs unsupervised learning, data preprocessing, and evaluation metrics.',
                        videoUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
                        videoDuration: 5400,
                        isFree: true,
                        order: 1,
                        resources: []
                    },
                    {
                        title: 'Scikit-Learn & Regression Models',
                        description: 'Building linear and polynomial regression models with Scikit-Learn.',
                        videoUrl: 'https://www.youtube.com/watch?v=0Lt9w-BxKFQ',
                        videoDuration: 3800,
                        isFree: false,
                        order: 2,
                        resources: []
                    }
                ]
            }
        ]
    }
};

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        require('../models/User');
        require('../models/Category');
        const Course = require('../models/Course');

        for (const [title, data] of Object.entries(realCourseData)) {
            const course = await Course.findOne({ title });
            if (!course) {
                console.log(`Course not found: "${title}" - skipping`);
                continue;
            }

            course.sections = data.sections;

            // Recalculate duration & lessons
            let totalDuration = 0;
            let totalLessons = 0;
            data.sections.forEach(s => {
                s.lessons.forEach(l => {
                    totalDuration += (l.videoDuration || 0);
                    totalLessons += 1;
                });
            });
            course.totalDuration = totalDuration;
            course.totalLessons = totalLessons;

            await course.save();
            console.log(`Updated course "${title}" with ${totalLessons} lessons (${Math.round(totalDuration / 60)} mins) [100% YouTube]`);
        }

        console.log('All course videos successfully converted to YouTube videos!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
