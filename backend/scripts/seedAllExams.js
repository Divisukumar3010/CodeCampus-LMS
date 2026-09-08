const mongoose = require('mongoose');
require('dotenv').config();

const Course = require('../models/Course');
const Exam = require('../models/Exam');
const User = require('../models/User');

const courseExamsData = [
    {
        courseTitle: 'Complete Web Development Bootcamp 2024',
        title: 'Full Stack Web Development Certification Exam',
        description: 'Comprehensive assessment covering HTML5 semantic markup, modern CSS layouts, JavaScript ES6+, React component architecture, Node.js runtime, and MongoDB database design.',
        duration: 30,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'Which HTML5 semantic element is best suited for independent, self-contained content such as a blog post or news story?',
                explanation: '<article> represents a complete, self-contained composition in a document, page, application, or site.',
                options: [
                    { text: '<section>', isCorrect: false },
                    { text: '<article>', isCorrect: true },
                    { text: '<aside>', isCorrect: false },
                    { text: '<div>', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'In CSS Flexbox, which property aligns items along the cross-axis?',
                explanation: 'align-items controls cross-axis alignment, while justify-content controls main-axis alignment.',
                options: [
                    { text: 'justify-content', isCorrect: false },
                    { text: 'align-items', isCorrect: true },
                    { text: 'align-content', isCorrect: false },
                    { text: 'flex-direction', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'What is the primary difference between let and const in JavaScript?',
                explanation: 'let allows variable reassignment, whereas const creates a read-only reference that cannot be reassigned.',
                options: [
                    { text: 'let is block-scoped, const is function-scoped', isCorrect: false },
                    { text: 'const variables cannot be reassigned; let variables can', isCorrect: true },
                    { text: 'const is hoisted, let is not hoisted', isCorrect: false },
                    { text: 'let is only used for numbers and const for strings', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'In React, what hook is used to manage side effects such as data fetching, subscriptions, or DOM mutations?',
                explanation: 'useEffect is specifically designed for handling lifecycle side effects in functional components.',
                options: [
                    { text: 'useState', isCorrect: false },
                    { text: 'useEffect', isCorrect: true },
                    { text: 'useContext', isCorrect: false },
                    { text: 'useReducer', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'In Node.js Express framework, what is the role of the next() function in middleware?',
                explanation: 'Calling next() passes control to the next middleware function in the request-response cycle.',
                options: [
                    { text: 'It sends the response immediately to the client', isCorrect: false },
                    { text: 'It passes execution to the next middleware in the pipeline', isCorrect: true },
                    { text: 'It resets the request parameters', isCorrect: false },
                    { text: 'It restarts the Express server', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'What HTTP status code represents a resource created successfully on the server?',
                explanation: 'HTTP 201 Created indicates that the request has succeeded and led to the creation of a resource.',
                options: [
                    { text: '200 OK', isCorrect: false },
                    { text: '201 Created', isCorrect: true },
                    { text: '204 No Content', isCorrect: false },
                    { text: '304 Not Modified', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'In MongoDB, which method is used to retrieve documents that match a query filter?',
                explanation: 'find() queries the collection for documents matching the filter criteria.',
                options: [
                    { text: 'db.collection.search()', isCorrect: false },
                    { text: 'db.collection.find()', isCorrect: true },
                    { text: 'db.collection.select()', isCorrect: false },
                    { text: 'db.collection.fetch()', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'Which CSS grid property allows defining explicit column sizes with fractional units?',
                explanation: 'grid-template-columns defines the track sizing functions of grid columns, supporting the fr unit.',
                options: [
                    { text: 'grid-template-columns: repeat(3, 1fr)', isCorrect: true },
                    { text: 'grid-columns: 1fr 1fr 1fr', isCorrect: false },
                    { text: 'grid-auto-flow: columns', isCorrect: false },
                    { text: 'display: flex-columns', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'What is the purpose of CORS (Cross-Origin Resource Sharing)?',
                explanation: 'CORS is a security mechanism that allows or restricts web applications on one domain from requesting resources on another domain.',
                options: [
                    { text: 'To compress images before sending to client', isCorrect: false },
                    { text: 'To securely allow browser requests across different origins/domains', isCorrect: true },
                    { text: 'To encrypt database passwords', isCorrect: false },
                    { text: 'To automate CSS preprocessing', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'What happens when a React component re-renders?',
                explanation: 'The function component re-executes, generates a new Virtual DOM tree, diffs it with the previous tree, and updates only the changed DOM nodes.',
                options: [
                    { text: 'The entire browser page reloads completely', isCorrect: false },
                    { text: 'The component executes and React reconciles changes with the real DOM', isCorrect: true },
                    { text: 'All state variables are reset to their initial values', isCorrect: false },
                    { text: 'The browser cache is flushed', isCorrect: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'JavaScript from Zero to Hero',
        title: 'JavaScript Mastery Qualification Exam',
        description: 'Comprehensive assessment validating deep knowledge of JavaScript core syntax, closures, event loop, asynchronous promises, prototypes, and modern ES6+ features.',
        duration: 25,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'What will be logged by console.log(typeof NaN)?',
                explanation: 'In JavaScript, NaN (Not-a-Number) is technically of type "number".',
                options: [
                    { text: '"undefined"', isCorrect: false },
                    { text: '"nan"', isCorrect: false },
                    { text: '"number"', isCorrect: true },
                    { text: '"object"', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'What is a closure in JavaScript?',
                explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment).',
                options: [
                    { text: 'A function that takes another function as an argument', isCorrect: false },
                    { text: 'A function bundled with references to its outer lexical scope', isCorrect: true },
                    { text: 'A syntax error that closes execution', isCorrect: false },
                    { text: 'A method to close open network sockets', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'What is the key difference between == and === in JavaScript?',
                explanation: '== performs type coercion before comparison, whereas === (strict equality) checks both type and value without coercion.',
                options: [
                    { text: '== checks type and value, === checks only value', isCorrect: false },
                    { text: '=== checks both value and type without type coercion', isCorrect: true },
                    { text: 'They are completely identical in JavaScript', isCorrect: false },
                    { text: '=== can only be used on string data types', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'Which phase of the JavaScript Event Loop handles Promise callbacks (.then, .catch, .finally)?',
                explanation: 'Promise callbacks are scheduled in the Microtask queue, which has higher priority than Macrotask queue (setTimeout, setInterval).',
                options: [
                    { text: 'Macrotask Queue', isCorrect: false },
                    { text: 'Microtask Queue', isCorrect: true },
                    { text: 'Render Queue', isCorrect: false },
                    { text: 'I/O Polling Phase', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'What is the return value of Array.prototype.map()?',
                explanation: 'map() returns a brand new array populated with the results of calling a provided function on every element.',
                options: [
                    { text: 'The original array modified in place', isCorrect: false },
                    { text: 'A new array with the transformed elements', isCorrect: true },
                    { text: 'A single accumulated value', isCorrect: false },
                    { text: 'A boolean indicating if all elements passed', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'What does the "this" keyword refer to inside an ES6 arrow function?',
                explanation: 'Arrow functions do not have their own "this"; they lexically inherit "this" from the enclosing execution context.',
                options: [
                    { text: 'The global window object always', isCorrect: false },
                    { text: 'The lexical "this" of its enclosing context', isCorrect: true },
                    { text: 'The object before the dot where it was called', isCorrect: false },
                    { text: 'null', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'Which statement correctly handles potential errors in an async/await function?',
                explanation: 'A try...catch block is standard syntax for catching rejected promises in async/await functions.',
                options: [
                    { text: 'try { await fetch(); } catch (err) { ... }', isCorrect: true },
                    { text: 'await fetch().onError(err => ...)', isCorrect: false },
                    { text: 'catch { await fetch(); }', isCorrect: false },
                    { text: 'rescue (err) { await fetch(); }', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'What is the output of [1, 2, 3].reduce((acc, curr) => acc + curr, 0)?',
                explanation: 'The accumulator starts at 0 and adds 1 + 2 + 3 = 6.',
                options: [
                    { text: '0', isCorrect: false },
                    { text: '6', isCorrect: true },
                    { text: '[1, 2, 3]', isCorrect: false },
                    { text: 'undefined', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'Which ES6 feature allows unpacking values from arrays or properties from objects into distinct variables?',
                explanation: 'Destructuring assignment syntax makes it possible to unpack properties or elements into distinct variables.',
                options: [
                    { text: 'Currying', isCorrect: false },
                    { text: 'Destructuring', isCorrect: true },
                    { text: 'Polymorphism', isCorrect: false },
                    { text: 'Coercion', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'What does Object.freeze(obj) accomplish?',
                explanation: 'Object.freeze() prevents new properties from being added, existing properties from being removed, and prevents changing property values.',
                options: [
                    { text: 'Deletes all properties of the object', isCorrect: false },
                    { text: 'Prevents extensions and makes existing properties non-writable and non-configurable', isCorrect: true },
                    { text: 'Converts the object to a JSON string', isCorrect: false },
                    { text: 'Copies the object into local storage', isCorrect: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'Data Science Masterclass with Python',
        title: 'Data Science & Python Analysis Certification Exam',
        description: 'Comprehensive test on Python data manipulation with NumPy and Pandas, statistical analysis, data cleaning, and visualization techniques.',
        duration: 30,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'Which Python library is the foundational standard for fast numerical computing and N-dimensional array processing?',
                explanation: 'NumPy provides the ndarray data structure and vectorised mathematical operations.',
                options: [
                    { text: 'Requests', isCorrect: false },
                    { text: 'NumPy', isCorrect: true },
                    { text: 'Flask', isCorrect: false },
                    { text: 'BeautifulSoup', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'In Pandas, what method drops rows containing missing (NaN) values from a DataFrame?',
                explanation: 'df.dropna() removes rows containing missing values.',
                options: [
                    { text: 'df.remove_empty()', isCorrect: false },
                    { text: 'df.dropna()', isCorrect: true },
                    { text: 'df.clean()', isCorrect: false },
                    { text: 'df.filter_nulls()', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'What is the primary difference between df.loc[] and df.iloc[] in Pandas?',
                explanation: 'loc is label-based indexing, whereas iloc is integer position-based indexing.',
                options: [
                    { text: 'loc is label-based, while iloc is integer position-based', isCorrect: true },
                    { text: 'loc is for columns only, iloc is for rows only', isCorrect: false },
                    { text: 'iloc works only on strings, loc works on numbers', isCorrect: false },
                    { text: 'There is no difference, both are aliases', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'What statistical measure represents the middle value in an ordered set of numbers?',
                explanation: 'The median is the 50th percentile (middle value) of an ordered distribution.',
                options: [
                    { text: 'Mean', isCorrect: false },
                    { text: 'Median', isCorrect: true },
                    { text: 'Mode', isCorrect: false },
                    { text: 'Variance', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'In Matplotlib and Seaborn, which chart type is best suited to display the distribution and outliers of a continuous variable?',
                explanation: 'Box plots (box-and-whisker plots) concisely display medians, quartiles, and statistical outliers.',
                options: [
                    { text: 'Pie chart', isCorrect: false },
                    { text: 'Box plot', isCorrect: true },
                    { text: 'Donut chart', isCorrect: false },
                    { text: 'Radar chart', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'What is the Pearson correlation coefficient range?',
                explanation: 'The Pearson correlation coefficient ranges from -1 (perfect negative correlation) to +1 (perfect positive correlation).',
                options: [
                    { text: '0 to 1', isCorrect: false },
                    { text: '-1 to +1', isCorrect: true },
                    { text: '-100 to +100', isCorrect: false },
                    { text: '0 to infinity', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'Which technique is commonly used to convert categorical string columns into binary indicator variables for modeling?',
                explanation: 'One-hot encoding (e.g. pd.get_dummies) converts categorical categories into numerical binary flags.',
                options: [
                    { text: 'Linear regression', isCorrect: false },
                    { text: 'One-Hot Encoding', isCorrect: true },
                    { text: 'StandardScaler', isCorrect: false },
                    { text: 'Principal Component Analysis', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'In Pandas, which method groups data to perform aggregations such as sum, mean, or count?',
                explanation: 'df.groupby() splits the data into groups based on some criteria and applies aggregate functions.',
                options: [
                    { text: 'df.cluster()', isCorrect: false },
                    { text: 'df.groupby()', isCorrect: true },
                    { text: 'df.combine()', isCorrect: false },
                    { text: 'df.partition()', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'What does the standard deviation of a dataset measure?',
                explanation: 'Standard deviation measures the dispersion or spread of data points relative to their mean.',
                options: [
                    { text: 'The most frequent value in the dataset', isCorrect: false },
                    { text: 'The dispersion or spread of values around the mean', isCorrect: true },
                    { text: 'The total number of samples', isCorrect: false },
                    { text: 'The ratio between maximum and minimum value', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'What is the consequence of data leakage during model preprocessing?',
                explanation: 'Data leakage happens when test set information inadvertently influences training, leading to unrealistically optimistic validation metrics and poor generalization.',
                options: [
                    { text: 'Hardware memory runs out during training', isCorrect: false },
                    { text: 'Overly optimistic metrics during evaluation with poor performance on genuine unseen data', isCorrect: true },
                    { text: 'The dataset size is cut in half', isCorrect: false },
                    { text: 'All values convert to zeros', isCorrect: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'React Native - Build Mobile Apps',
        title: 'React Native Mobile Engineering Qualification Exam',
        description: 'Rigorous assessment evaluating competence in cross-platform mobile development, native components, styling, navigation, and asynchronous storage.',
        duration: 25,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'Which React Native core component replaces the HTML <div> for layout containers?',
                explanation: '<View> is the fundamental container component in React Native, rendering to native UIView on iOS and android.view.ViewGroup on Android.',
                options: [
                    { text: '<Container>', isCorrect: false },
                    { text: '<View>', isCorrect: true },
                    { text: '<Section>', isCorrect: false },
                    { text: '<Box>', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'In React Native, what is the default flex-direction of a <View>?',
                explanation: 'Unlike the web (where flex-direction defaults to "row"), React Native defaults flex-direction to "column".',
                options: [
                    { text: 'row', isCorrect: false },
                    { text: 'column', isCorrect: true },
                    { text: 'row-reverse', isCorrect: false },
                    { text: 'column-reverse', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'Which component should be used to display text on screen in React Native?',
                explanation: 'Text cannot be rendered directly inside a View; all strings must be wrapped in a <Text> component.',
                options: [
                    { text: '<span>', isCorrect: false },
                    { text: '<Text>', isCorrect: true },
                    { text: '<Typography>', isCorrect: false },
                    { text: '<Label>', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'Which library is standard for handling screen transitions and routing in React Native?',
                explanation: 'React Navigation is the official and community standard routing solution for React Native apps.',
                options: [
                    { text: 'react-router-dom', isCorrect: false },
                    { text: 'React Navigation', isCorrect: true },
                    { text: 'next/router', isCorrect: false },
                    { text: 'Vue Router', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'Why is FlatList preferred over ScrollView for long or dynamic lists?',
                explanation: 'FlatList lazily renders only items currently on or near the screen, conserving memory and ensuring 60fps performance.',
                options: [
                    { text: 'ScrollView cannot display images', isCorrect: false },
                    { text: 'FlatList virtualizes list items to conserve memory and maintain smooth scrolling', isCorrect: true },
                    { text: 'ScrollView only works on Android devices', isCorrect: false },
                    { text: 'FlatList requires no styling', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'What is the purpose of StyleSheet.create() in React Native?',
                explanation: 'StyleSheet.create validates style rules, optimizes memory by sending IDs through the bridge, and prevents regenerating style objects on every render.',
                options: [
                    { text: 'Compiles SASS into CSS', isCorrect: false },
                    { text: 'Validates and optimizes style definitions for performance', isCorrect: true },
                    { text: 'Downloads themes from the cloud', isCorrect: false },
                    { text: 'Renders stylesheets in HTML head', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'Which module is used for persistent, unencrypted, key-value storage across app restarts?',
                explanation: '@react-native-async-storage/async-storage is the standard asynchronous key-value storage system.',
                options: [
                    { text: 'window.localStorage', isCorrect: false },
                    { text: 'AsyncStorage', isCorrect: true },
                    { text: 'IndexedDB', isCorrect: false },
                    { text: 'SessionStorage', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'Which hook provides access to the current screen dimensions and window orientation?',
                explanation: 'useWindowDimensions automatically updates when device dimensions or orientation change.',
                options: [
                    { text: 'useDimensions', isCorrect: false },
                    { text: 'useWindowDimensions', isCorrect: true },
                    { text: 'useScreenSize', isCorrect: false },
                    { text: 'useOrientation', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'What does SafeAreaView do on mobile devices?',
                explanation: 'SafeAreaView applies padding to avoid device notches, status bars, and home indicator bars (especially on modern iPhones and Android edge displays).',
                options: [
                    { text: 'Encrypts user input data', isCorrect: false },
                    { text: 'Renders content within the safe boundaries of the physical device screen', isCorrect: true },
                    { text: 'Restricts camera and microphone access', isCorrect: false },
                    { text: 'Prevents screenshots from being taken', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'How does React Native communicate between JavaScript and native platform threads (in the traditional architecture)?',
                explanation: 'The Bridge asynchronously serializes JSON messages between the JavaScript thread and the native UI thread.',
                options: [
                    { text: 'Through WebSocket protocols', isCorrect: false },
                    { text: 'Through the asynchronous serialized JavaScript-Native Bridge', isCorrect: true },
                    { text: 'By compiling JavaScript into raw C++ at runtime', isCorrect: false },
                    { text: 'Through HTTP REST endpoints', isCorrect: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'Machine Learning A-Z',
        title: 'Machine Learning & Applied AI Certification Exam',
        description: 'Comprehensive examination covering supervised and unsupervised algorithms, bias-variance tradeoff, cross-validation, feature scaling, and model evaluation metrics.',
        duration: 30,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'What type of machine learning problem involves predicting continuous numerical target values (e.g. house prices)?',
                explanation: 'Regression tasks predict continuous quantitative outputs, whereas classification predicts discrete class labels.',
                options: [
                    { text: 'Classification', isCorrect: false },
                    { text: 'Regression', isCorrect: true },
                    { text: 'Clustering', isCorrect: false },
                    { text: 'Dimensionality Reduction', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'What is overfitting in machine learning?',
                explanation: 'Overfitting occurs when a model learns noise and training data peculiarities too closely, resulting in poor generalization to unseen test data.',
                options: [
                    { text: 'The model performs poorly on both training and test data', isCorrect: false },
                    { text: 'The model fits training data too closely and generalizes poorly to new data', isCorrect: true },
                    { text: 'The dataset has too few features', isCorrect: false },
                    { text: 'The gradient descent converges too quickly', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'Which evaluation metric represents the harmonic mean of Precision and Recall?',
                explanation: 'The F1-Score is the harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall).',
                options: [
                    { text: 'Accuracy', isCorrect: false },
                    { text: 'F1-Score', isCorrect: true },
                    { text: 'Mean Squared Error', isCorrect: false },
                    { text: 'ROC-AUC', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'Which algorithm is an ensemble method composed of multiple decision trees trained with bagging and random feature selection?',
                explanation: 'Random Forest builds multiple decision trees using bootstrap aggregating (bagging) and random feature subsets.',
                options: [
                    { text: 'K-Means', isCorrect: false },
                    { text: 'Random Forest', isCorrect: true },
                    { text: 'Naive Bayes', isCorrect: false },
                    { text: 'Linear Regression', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'Why is feature scaling (e.g. StandardScaler or MinMaxScaler) critical for distance-based algorithms like KNN and SVM?',
                explanation: 'Distance calculations (like Euclidean distance) are dominated by features with larger numerical ranges if not scaled.',
                options: [
                    { text: 'It reduces the total number of rows in the dataset', isCorrect: false },
                    { text: 'It ensures features with larger magnitudes do not disproportionately dominate distance calculations', isCorrect: true },
                    { text: 'It converts negative values into positive values', isCorrect: false },
                    { text: 'It is required by the Python language syntax', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'What is K-Fold Cross-Validation?',
                explanation: 'K-Fold cross-validation splits data into K subsets, iteratively training on K-1 folds and validating on the remaining fold to obtain a robust performance estimate.',
                options: [
                    { text: 'Clustering data into K distinct clusters', isCorrect: false },
                    { text: 'A validation technique splitting data into K partitions to test generalization robustness', isCorrect: true },
                    { text: 'Multiplying data rows by K to artificially inflate training size', isCorrect: false },
                    { text: 'Selecting the top K features', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'Which optimization algorithm iteratively adjusts weights in the direction opposite to the gradient of the loss function?',
                explanation: 'Gradient Descent updates model parameters in the direction of steepest descent (negative gradient) of the cost function.',
                options: [
                    { text: 'Monte Carlo simulation', isCorrect: false },
                    { text: 'Gradient Descent', isCorrect: true },
                    { text: 'A* Search', isCorrect: false },
                    { text: 'Bubble Sort', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'Which unsupervised learning technique is used to reduce the number of features while retaining maximum variance?',
                explanation: 'Principal Component Analysis (PCA) performs orthogonal linear transformation to project data into lower-dimensional space while preserving variance.',
                options: [
                    { text: 'Logistic Regression', isCorrect: false },
                    { text: 'Principal Component Analysis (PCA)', isCorrect: true },
                    { text: 'Decision Trees', isCorrect: false },
                    { text: 'K-Nearest Neighbors', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'In a confusion matrix for medical diagnosis, what is a False Negative?',
                explanation: 'A False Negative occurs when a condition is present (positive), but the model incorrectly predicts healthy/absent (negative).',
                options: [
                    { text: 'Predicting a sick patient is healthy', isCorrect: true },
                    { text: 'Predicting a healthy patient is sick', isCorrect: false },
                    { text: 'Correctly identifying a healthy patient', isCorrect: false },
                    { text: 'Correctly diagnosing an illness', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'What does the learning rate hyperparameter control in training neural networks or gradient boosting?',
                explanation: 'The learning rate scales the magnitude of parameter updates at each optimization step.',
                options: [
                    { text: 'The number of epochs to train for', isCorrect: false },
                    { text: 'The step size taken towards the minimum of the loss function in each iteration', isCorrect: true },
                    { text: 'The percentage of training data held out for testing', isCorrect: false },
                    { text: 'The number of hidden layers in the network', isCorrect: false }
                ]
            }
        ]
    },
    {
        courseTitle: 'Database Design & Advanced SQL',
        title: 'Database Architecture & Advanced SQL Certification Exam',
        description: 'Comprehensive examination assessing skills in relational modeling, indexing strategies, ACID transactions, complex joins, subqueries, and window functions.',
        duration: 30,
        passingScore: 60,
        maxAttempts: 3,
        questions: [
            {
                order: 1,
                points: 1,
                questionText: 'What is the primary objective of Database Normalization (up to 3NF)?',
                explanation: 'Normalization organizes columns and tables to minimize duplicate data (redundancy) and prevent anomalies during inserts, updates, and deletes.',
                options: [
                    { text: 'To encrypt all stored tables', isCorrect: false },
                    { text: 'To reduce data redundancy and eliminate insert, update, and deletion anomalies', isCorrect: true },
                    { text: 'To make queries run slower for security', isCorrect: false },
                    { text: 'To convert SQL queries into JSON', isCorrect: false }
                ]
            },
            {
                order: 2,
                points: 1,
                questionText: 'Which SQL JOIN returns all rows from the left table, and matching rows from the right table, filling with NULL when there is no match?',
                explanation: 'A LEFT JOIN (or LEFT OUTER JOIN) guarantees all records from the left table are returned regardless of whether matching right records exist.',
                options: [
                    { text: 'INNER JOIN', isCorrect: false },
                    { text: 'LEFT JOIN', isCorrect: true },
                    { text: 'CROSS JOIN', isCorrect: false },
                    { text: 'FULL OUTER JOIN', isCorrect: false }
                ]
            },
            {
                order: 3,
                points: 1,
                questionText: 'What does the "I" stand for in the ACID properties of database transactions?',
                explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Isolation ensures concurrent transactions do not interfere with each other.',
                options: [
                    { text: 'Integrity', isCorrect: false },
                    { text: 'Isolation', isCorrect: true },
                    { text: 'Indexing', isCorrect: false },
                    { text: 'Iteration', isCorrect: false }
                ]
            },
            {
                order: 4,
                points: 1,
                questionText: 'Which index data structure is most commonly utilized by relational database management systems (e.g. PostgreSQL, MySQL) for range and equality queries?',
                explanation: 'B-Tree (and B+ Tree) structures provide O(log N) search, insertion, and deletion times, as well as efficient ordered range scanning.',
                options: [
                    { text: 'Linked List', isCorrect: false },
                    { text: 'B-Tree / B+ Tree', isCorrect: true },
                    { text: 'Bloom Filter', isCorrect: false },
                    { text: 'Heap Sort', isCorrect: false }
                ]
            },
            {
                order: 5,
                points: 1,
                questionText: 'What is the difference between WHERE and HAVING clauses in SQL?',
                explanation: 'WHERE filters rows before any groupings or aggregations are computed; HAVING filters aggregated groups after GROUP BY.',
                options: [
                    { text: 'WHERE filters aggregated groups; HAVING filters individual rows', isCorrect: false },
                    { text: 'WHERE filters individual rows prior to grouping; HAVING filters aggregated groups after GROUP BY', isCorrect: true },
                    { text: 'They are completely interchangeable in SQL', isCorrect: false },
                    { text: 'HAVING can only be used with SELECT * statements', isCorrect: false }
                ]
            },
            {
                order: 6,
                points: 1,
                questionText: 'Which SQL Window Function computes a rank for each row within a partition, with consecutive rank values without gaps for ties?',
                explanation: 'DENSE_RANK() assigns consecutive ranks without skipping rank numbers when ties occur, unlike RANK().',
                options: [
                    { text: 'ROW_NUMBER()', isCorrect: false },
                    { text: 'DENSE_RANK()', isCorrect: true },
                    { text: 'RANK()', isCorrect: false },
                    { text: 'NTILE()', isCorrect: false }
                ]
            },
            {
                order: 7,
                points: 1,
                questionText: 'What is a Foreign Key constraint in relational databases?',
                explanation: 'A foreign key creates a link between data in two tables, enforcing referential integrity so child records must reference existing parent keys.',
                options: [
                    { text: 'A key stored on an external cloud database', isCorrect: false },
                    { text: 'A column or group of columns enforcing referential integrity with a primary key in another table', isCorrect: true },
                    { text: 'An encryption key used for secure network transfers', isCorrect: false },
                    { text: 'A duplicate primary key in the same table', isCorrect: false }
                ]
            },
            {
                order: 8,
                points: 1,
                questionText: 'What is the purpose of the EXPLAIN command in SQL query optimization?',
                explanation: 'EXPLAIN reveals the query execution plan chosen by the database query optimizer, displaying table scans, index lookups, and estimated costs.',
                options: [
                    { text: 'Translates SQL code into English documentation', isCorrect: false },
                    { text: 'Displays the query execution plan and cost estimates generated by the query optimizer', isCorrect: true },
                    { text: 'Validates user passwords', isCorrect: false },
                    { text: 'Exports query results as CSV', isCorrect: false }
                ]
            },
            {
                order: 9,
                points: 1,
                questionText: 'Which SQL statement undoes all changes made within the current transaction before they are permanently stored?',
                explanation: 'ROLLBACK undoes changes made within the current uncommitted transaction.',
                options: [
                    { text: 'REVOKE', isCorrect: false },
                    { text: 'ROLLBACK', isCorrect: true },
                    { text: 'DISCARD', isCorrect: false },
                    { text: 'TRUNCATE', isCorrect: false }
                ]
            },
            {
                order: 10,
                points: 1,
                questionText: 'When is an index scan less efficient than a sequential full table scan?',
                explanation: 'When a query retrieves a very large percentage of rows in a table, sequential I/O of a full table scan can be faster than random I/O from index lookups.',
                options: [
                    { text: 'When the table contains more than 10 columns', isCorrect: false },
                    { text: 'When the query retrieves a large percentage of total rows in the table', isCorrect: true },
                    { text: 'When the database is hosted on Linux', isCorrect: false },
                    { text: 'When primary keys are integers', isCorrect: false }
                ]
            }
        ]
    }
];

async function seedAllCourseExams() {
    try {
        console.log('Connecting to MongoDB Atlas (CodeCampusDB)...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully.');

        // Find an admin user to assign as createdBy
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            throw new Error('No admin user found. Please ensure users are seeded first.');
        }

        console.log(`Using admin user: ${adminUser.name} (${adminUser.email})`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of courseExamsData) {
            const course = await Course.findOne({ title: item.courseTitle });
            if (!course) {
                console.warn(`⚠️ Course not found for title: "${item.courseTitle}". Skipping...`);
                continue;
            }

            const existingExam = await Exam.findOne({ course: course._id });

            if (existingExam) {
                // Update questions & attributes
                existingExam.title = item.title;
                existingExam.description = item.description;
                existingExam.duration = item.duration;
                existingExam.passingScore = item.passingScore;
                existingExam.maxAttempts = item.maxAttempts;
                existingExam.questions = item.questions;
                existingExam.totalQuestions = item.questions.length;
                existingExam.totalPoints = item.questions.reduce((s, q) => s + q.points, 0);
                existingExam.isActive = true;
                existingExam.createdBy = adminUser._id;
                await existingExam.save();
                updatedCount++;
                console.log(`🔄 Updated exam for "${course.title}" (${item.questions.length} questions)`);
            } else {
                const newExam = new Exam({
                    course: course._id,
                    title: item.title,
                    description: item.description,
                    duration: item.duration,
                    passingScore: item.passingScore,
                    maxAttempts: item.maxAttempts,
                    questions: item.questions,
                    totalQuestions: item.questions.length,
                    totalPoints: item.questions.reduce((s, q) => s + q.points, 0),
                    isActive: true,
                    createdBy: adminUser._id
                });
                await newExam.save();
                createdCount++;
                console.log(`✅ Created new exam for "${course.title}" (${item.questions.length} questions)`);
            }
        }

        const totalExams = await Exam.countDocuments();
        console.log('');
        console.log(`Done! Total exams in DB: ${totalExams} (Created: ${createdCount}, Updated: ${updatedCount})`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding course exams:', err);
        process.exit(1);
    }
}

seedAllCourseExams();
