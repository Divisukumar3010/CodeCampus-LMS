const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const User = require('./models/User');
const Course = require('./models/Course');
const Exam = require('./models/Exam');
const ExamAttempt = require('./models/ExamAttempt');
const connectDatabase = require('./config/database');

dotenv.config();

const categories = [
    {
        name: 'Web Development',
        slug: 'web-development',
        icon: '💻',
        description: 'Learn to build websites and web applications',
        isActive: true
    },
    {
        name: 'Mobile Development',
        slug: 'mobile-development',
        icon: '📱',
        description: 'Create mobile apps for iOS and Android',
        isActive: true
    },
    {
        name: 'Data Science',
        slug: 'data-science',
        icon: '📊',
        description: 'Analyze and visualize data with Python and R',
        isActive: true
    },
    {
        name: 'Machine Learning',
        slug: 'machine-learning',
        icon: '🤖',
        description: 'Build intelligent systems and AI models',
        isActive: true
    },
    {
        name: 'UI/UX Design',
        slug: 'ui-ux-design',
        icon: '🎨',
        description: 'Design beautiful and intuitive user interfaces',
        isActive: true
    },
    {
        name: 'Business',
        slug: 'business',
        icon: '💼',
        description: 'Learn business management and entrepreneurship',
        isActive: true
    },
    {
        name: 'Digital Marketing',
        slug: 'digital-marketing',
        icon: '📈',
        description: 'Master digital marketing strategies',
        isActive: true
    },
    {
        name: 'Photography',
        slug: 'photography',
        icon: '📸',
        description: 'Professional photography and videography',
        isActive: true
    },
    {
        name: 'Databases',
        slug: 'databases',
        icon: '🗄️',
        description: 'Learn database design, SQL, NoSQL and data management',
        isActive: true
    },
];

const seedDatabase = async () => {
    try {
        // Connect to database
        await connectDatabase();
        console.log('🔗 Connected to database');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Category.deleteMany(),
            User.deleteMany(),
            Course.deleteMany()
        ]);
        console.log('✅ Data cleared');

        // Insert categories
        console.log('📚 Creating categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ ${createdCategories.length} categories created`);

        // Create users
        console.log('👥 Creating users...');

        // Admin
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@codecampus.com',
            password: 'Admin@123',
            role: 'admin',
            isVerified: true,
            isActive: true,
        });
        console.log('✅ Admin created');

        // Trainers
        const trainer1 = await User.create({
            name: 'John Doe',
            email: 'trainer@codecampus.com',
            password: 'Trainer@123',
            role: 'trainer',
            isVerified: true,
            isActive: true,
            bio: 'Full-stack developer with 10+ years of experience',
            expertise: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        });

        const trainer2 = await User.create({
            name: 'Sarah Johnson',
            email: 'sarah@codecampus.com',
            password: 'Trainer@123',
            role: 'trainer',
            isVerified: true,
            isActive: true,
            bio: 'Data scientist and ML expert',
            expertise: ['Python', 'Machine Learning', 'Data Analysis'],
        });

        const trainer3 = await User.create({
            name: 'Mike Wilson',
            email: 'mike@codecampus.com',
            password: 'Trainer@123',
            role: 'trainer',
            isVerified: true,
            isActive: true,
            bio: 'Mobile app developer specializing in React Native',
            expertise: ['React Native', 'iOS', 'Android'],
        });

        console.log('✅ 3 trainers created');

        // Student
        const student = await User.create({
            name: 'Jane Student',
            email: 'student@codecampus.com',
            password: 'Student@123',
            role: 'student',
            isVerified: true,
            isActive: true,
        });
        console.log('✅ Student created');

        // Create sample courses
        console.log('📖 Creating sample courses...');

        const webDevCategory = createdCategories.find(c => c.name === 'Web Development');
        const dataScienceCategory = createdCategories.find(c => c.name === 'Data Science');
        const mobileCategory = createdCategories.find(c => c.name === 'Mobile Development');

        const courses = [
            {
                title: 'Complete Web Development Bootcamp 2024',
                subtitle: 'Learn HTML, CSS, JavaScript, React, Node.js and MongoDB',
                description: 'Master web development from scratch. Build real-world projects and become a full-stack developer. This comprehensive course covers everything you need to know to start your career in web development.',
                category: webDevCategory._id,
                level: 'beginner',
                language: 'English',
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'
                },
                price: 89.99,
                discountPrice: 49.99,
                trainer: trainer1._id,
                whatYouWillLearn: [
                    'Build responsive websites with HTML, CSS, and JavaScript',
                    'Create dynamic web applications with React',
                    'Develop backend APIs with Node.js and Express',
                    'Work with MongoDB databases',
                    'Deploy applications to production'
                ],
                requirements: [
                    'Basic computer skills',
                    'No prior programming experience needed',
                    'A computer with internet connection'
                ],
                targetAudience: [
                    'Beginners who want to learn web development',
                    'Students looking to start a career in tech',
                    'Anyone interested in building websites'
                ],
                status: 'published',
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                tags: ['web development', 'html', 'css', 'javascript', 'react', 'nodejs'],
                sections: [
                    {
                        title: 'Full Stack & MERN Architecture',
                        description: 'Overview of modern full-stack web architecture with MongoDB, Express, React, and Node',
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
                    }
                ],
                enrollmentCount: 1234,
                averageRating: 4.8,
                totalReviews: 456
            },
            {
                title: 'Data Science Masterclass with Python',
                subtitle: 'Learn Python, Pandas, NumPy, Matplotlib and Machine Learning',
                description: 'Become a data scientist with this comprehensive course. Learn to analyze data, create visualizations, and build machine learning models using Python.',
                category: dataScienceCategory._id,
                level: 'intermediate',
                language: 'English',
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800'
                },
                price: 99.99,
                discountPrice: 59.99,
                trainer: trainer2._id,
                whatYouWillLearn: [
                    'Python programming fundamentals',
                    'Data manipulation with Pandas',
                    'Data visualization with Matplotlib and Seaborn',
                    'Statistical analysis and hypothesis testing',
                    'Machine learning algorithms'
                ],
                requirements: [
                    'Basic programming knowledge helpful but not required',
                    'High school mathematics',
                    'Computer with Python installed'
                ],
                targetAudience: [
                    'Aspiring data scientists',
                    'Business analysts',
                    'Anyone interested in data analysis'
                ],
                status: 'published',
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                tags: ['data science', 'python', 'machine learning', 'pandas'],
                sections: [
                    {
                        title: 'Python for Data Science',
                        description: 'Master Python basics and libraries',
                        order: 1,
                        lessons: [
                            {
                                title: 'Python for Beginners - Crash Course',
                                description: 'Getting started with Python',
                                videoUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
                                videoDuration: 3600,
                                isFree: true,
                                order: 1,
                                resources: []
                            },
                            {
                                title: 'NumPy Tutorial: Data Manipulation',
                                description: 'Working with arrays and matrices',
                                videoUrl: 'https://www.youtube.com/watch?v=QUT1VHiLmmI',
                                videoDuration: 3500,
                                isFree: false,
                                order: 2,
                                resources: []
                            }
                        ]
                    }
                ],
                enrollmentCount: 987,
                averageRating: 4.7,
                totalReviews: 234
            },
            {
                title: 'React Native - Build Mobile Apps',
                subtitle: 'Create iOS and Android apps with React Native',
                description: 'Learn to build cross-platform mobile applications using React Native. Deploy to both iOS and Android from a single codebase.',
                category: mobileCategory._id,
                level: 'intermediate',
                language: 'English',
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800'
                },
                price: 79.99,
                discountPrice: 39.99,
                trainer: trainer3._id,
                whatYouWillLearn: [
                    'Build native mobile apps with React Native',
                    'Use native device features',
                    'Implement navigation and state management',
                    'Connect to backend APIs',
                    'Publish apps to App Store and Google Play'
                ],
                requirements: [
                    'JavaScript knowledge required',
                    'React experience helpful',
                    'Mac required for iOS development'
                ],
                targetAudience: [
                    'Web developers wanting to build mobile apps',
                    'React developers',
                    'Mobile app enthusiasts'
                ],
                status: 'published',
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                tags: ['react native', 'mobile development', 'ios', 'android'],
                sections: [
                    {
                        title: 'Getting Started with React Native',
                        description: 'Setup and basics',
                        order: 1,
                        lessons: [
                            {
                                title: 'React Native Crash Course & Expo Setup',
                                description: 'Introduction to React Native and mobile development',
                                videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
                                videoDuration: 4200,
                                isFree: true,
                                order: 1,
                                resources: []
                            }
                        ]
                    }
                ],
                enrollmentCount: 756,
                averageRating: 4.9,
                totalReviews: 189
            },
            {
                title: 'JavaScript from Zero to Hero',
                subtitle: 'Master modern JavaScript and ES6+',
                description: 'Complete JavaScript course covering everything from basics to advanced concepts. Perfect for beginners and those wanting to master JavaScript.',
                category: webDevCategory._id,
                level: 'beginner',
                language: 'English',
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800'
                },
                price: 69.99,
                trainer: trainer1._id,
                whatYouWillLearn: [
                    'JavaScript fundamentals',
                    'ES6+ features',
                    'Asynchronous JavaScript',
                    'DOM manipulation',
                    'Modern JavaScript patterns'
                ],
                requirements: [
                    'Basic HTML and CSS knowledge',
                    'No programming experience required'
                ],
                targetAudience: [
                    'Complete beginners',
                    'Developers wanting to learn JavaScript',
                    'Web development students'
                ],
                status: 'published',
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                tags: ['javascript', 'es6', 'programming'],
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
                ],
                enrollmentCount: 2341,
                averageRating: 4.6,
                totalReviews: 567
            },
            {
                title: 'Machine Learning A-Z',
                subtitle: 'Hands-On Python & R in Data Science',
                description: 'Learn to create Machine Learning algorithms from scratch. Master ML with Python and R.',
                category: dataScienceCategory._id,
                level: 'advanced',
                language: 'English',
                thumbnail: {
                    url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800'
                },
                price: 109.99,
                discountPrice: 69.99,
                trainer: trainer2._id,
                whatYouWillLearn: [
                    'Master Machine Learning algorithms',
                    'Build ML models with Python and R',
                    'Understand deep learning',
                    'Work with real datasets',
                    'Deploy ML models'
                ],
                requirements: [
                    'Python or R programming knowledge',
                    'Mathematics fundamentals',
                    'Statistics basics'
                ],
                targetAudience: [
                    'Data scientists',
                    'ML engineers',
                    'AI enthusiasts'
                ],
                status: 'published',
                isApproved: true,
                approvedBy: admin._id,
                approvedAt: new Date(),
                tags: ['machine learning', 'ai', 'python', 'data science'],
                sections: [
                    {
                        title: 'Introduction to Machine Learning',
                        description: 'ML basics and concepts',
                        order: 1,
                        lessons: [
                            {
                                title: 'Machine Learning Course for Beginners',
                                description: 'Introduction to ML concepts and algorithms',
                                videoUrl: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
                                videoDuration: 5400,
                                isFree: true,
                                order: 1,
                                resources: []
                            }
                        ]
                    }
                ],
                enrollmentCount: 892,
                averageRating: 4.9,
                totalReviews: 321
            }
        ];

        const createdCourses = await Course.insertMany(courses);
        console.log(`✅ ${createdCourses.length} courses created`);

        // Update category course counts
        for (const category of createdCategories) {
            const count = await Course.countDocuments({ category: category._id });
            await Category.findByIdAndUpdate(category._id, { courseCount: count });
        }

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   ✅ ${createdCategories.length} categories`);
        console.log(`   ✅ 5 users (1 admin, 3 trainers, 1 student)`);
        console.log(`   ✅ ${createdCourses.length} courses`);
        console.log('');
        console.log('🔐 Login Credentials:');
        console.log('');
        console.log('   👨‍💼 Admin:');
        console.log('      Email: admin@codecampus.com');
        console.log('      Password: Admin@123');
        console.log('');
        console.log('   👨‍🏫 Trainer:');
        console.log('      Email: trainer@codecampus.com');
        console.log('      Password: Trainer@123');
        console.log('');
        console.log('   👨‍🎓 Student:');
        console.log('      Email: student@codecampus.com');
        console.log('      Password: Student@123');
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('   1. Start backend: npm run dev');
        console.log('   2. Start frontend: cd ../frontend && npm run dev');
        console.log('   3. Visit: http://localhost:5173');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();