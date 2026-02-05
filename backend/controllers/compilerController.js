const axios = require('axios');

// Language mapping for Judge0 API
const languageMap = {
    javascript: 63,    // JavaScript (Node.js 12.14.0)
    python: 71,        // Python (3.8.1)
    java: 62,          // Java (OpenJDK 13.0.1)
    c: 50,             // C (GCC 9.2.0)
    cpp: 54,           // C++ (GCC 9.2.0)
    html: 95,          // HTML, CSS, JavaScript
};

// Judge0 API endpoint
const JUDGE0_API = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || 'your-api-key';

// @desc    Execute code
// @route   POST /api/compiler/execute
// @access  Public
exports.executeCode = async (req, res, next) => {
    try {
        const { code, language, input } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                success: false,
                error: 'Code and language are required'
            });
        }

        if (!languageMap[language]) {
            return res.status(400).json({
                success: false,
                error: `Unsupported language: ${language}`
            });
        }

        // For HTML, return as-is
        if (language === 'html') {
            return res.status(200).json({
                success: true,
                output: code
            });
        }

        // Check if using Judge0 API
        if (!JUDGE0_API_KEY || JUDGE0_API_KEY === 'your-api-key') {
            // Fallback: Basic local execution
            return executeLocally(code, language, input, res);
        }

        // Use Judge0 API for execution
        const submissionData = {
            source_code: code,
            language_id: languageMap[language],
            stdin: input || '',
            wait: true,
            cpu_time_limit: 5,
            memory_limit: 128000,
        };

        try {
            const response = await axios.post(
                `${JUDGE0_API}/submissions`,
                submissionData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RapidAPI-Key': JUDGE0_API_KEY,
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    },
                    timeout: 10000,
                }
            );

            const result = response.data;

            if (result.stderr) {
                return res.status(200).json({
                    success: true,
                    error: result.stderr,
                    output: result.stdout || ''
                });
            }

            res.status(200).json({
                success: true,
                output: result.stdout || '(No output)',
                error: result.stderr || ''
            });
        } catch (error) {
            console.error('Judge0 API Error:', error.message);
            // Fallback to local execution
            return executeLocally(code, language, input, res);
        }
    } catch (error) {
        next(error);
    }
};

// Fallback local execution for basic languages
function executeLocally(code, language, input, res) {
    try {
        const { execSync } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        const os = require('os');

        const tempDir = os.tmpdir();
        let filename, command, output;

        switch (language) {
            case 'javascript': {
                // Execute JavaScript with console output capture
                let capturedOutput = '';
                const originalLog = console.log;
                const originalError = console.error;

                console.log = (...args) => {
                    capturedOutput += args.join(' ') + '\n';
                };

                console.error = (...args) => {
                    capturedOutput += args.join(' ') + '\n';
                };

                try {
                    eval(code);
                    console.log = originalLog;
                    console.error = originalError;
                    output = capturedOutput.trim() || '(No output)';
                } catch (err) {
                    console.log = originalLog;
                    console.error = originalError;
                    return res.status(200).json({
                        success: true,
                        error: err.message,
                        output: ''
                    });
                }
                break;
            }

            case 'python': {
                const timestamp = Date.now();
                filename = path.join(tempDir, `script_${timestamp}.py`);
                fs.writeFileSync(filename, code);
                try {
                    const { spawnSync } = require('child_process');
                    const result = spawnSync('python', [filename], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 5000,
                        maxBuffer: 1024 * 1024,
                    });

                    if (result.error) {
                        throw result.error;
                    }

                    output = (result.stdout || '') + (result.stderr || '');
                } catch (err) {
                    return res.status(200).json({
                        success: true,
                        error: err.stderr?.toString() || err.message,
                        output: ''
                    });
                } finally {
                    try { fs.unlinkSync(filename); } catch (e) { }
                }
                break;
            }

            case 'java': {
                // Extract public class name from code
                const classNameMatch = code.match(/public\s+class\s+(\w+)/);
                const className = classNameMatch ? classNameMatch[1] : 'Main';
                filename = path.join(tempDir, `${className}.java`);

                // If user provided a different public class name, use their code as-is
                // Otherwise, wrap in a class named Main if not already present
                let finalCode = code;
                if (!classNameMatch && !code.includes('class ')) {
                    finalCode = `public class Main {\n    public static void main(String[] args) {\n${code}\n    }\n}`;
                }

                fs.writeFileSync(filename, finalCode);
                try {
                    execSync(`javac "${filename}"`, { timeout: 5000, stdio: 'pipe' });

                    // Use spawnSync for better input handling on Windows
                    const { spawnSync } = require('child_process');
                    const result = spawnSync('java', ['-cp', tempDir, className], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 5000,
                        maxBuffer: 1024 * 1024,
                    });

                    if (result.error) {
                        throw result.error;
                    }

                    output = (result.stdout || '') + (result.stderr || '');
                } catch (err) {
                    return res.status(200).json({
                        success: true,
                        error: err.stderr?.toString() || err.message,
                        output: ''
                    });
                } finally {
                    try { fs.unlinkSync(filename); } catch (e) { }
                    const classFile = filename.replace('.java', '.class');
                    try { fs.unlinkSync(classFile); } catch (e) { }
                }
                break;
            }

            case 'c': {
                const timestamp = Date.now();
                filename = path.join(tempDir, `program_${timestamp}.c`);
                const exeFile = path.join(tempDir, `program_${timestamp}${os.platform() === 'win32' ? '.exe' : ''}`);
                fs.writeFileSync(filename, code);
                try {
                    execSync(`gcc "${filename}" -o "${exeFile}"`, { timeout: 5000, stdio: 'pipe' });

                    const { spawnSync } = require('child_process');
                    const result = spawnSync(exeFile, [], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 5000,
                        maxBuffer: 1024 * 1024,
                    });

                    if (result.error) {
                        throw result.error;
                    }

                    output = (result.stdout || '') + (result.stderr || '');
                } catch (err) {
                    return res.status(200).json({
                        success: true,
                        error: err.stderr?.toString() || err.message,
                        output: ''
                    });
                } finally {
                    try { fs.unlinkSync(filename); } catch (e) { }
                    try { fs.unlinkSync(exeFile); } catch (e) { }
                }
                break;
            }

            case 'cpp': {
                const timestamp = Date.now();
                filename = path.join(tempDir, `program_${timestamp}.cpp`);
                const exeFile = path.join(tempDir, `program_${timestamp}${os.platform() === 'win32' ? '.exe' : ''}`);
                fs.writeFileSync(filename, code);
                try {
                    execSync(`g++ "${filename}" -o "${exeFile}"`, { timeout: 5000, stdio: 'pipe' });

                    const { spawnSync } = require('child_process');
                    const result = spawnSync(exeFile, [], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 5000,
                        maxBuffer: 1024 * 1024,
                    });

                    if (result.error) {
                        throw result.error;
                    }

                    output = (result.stdout || '') + (result.stderr || '');
                } catch (err) {
                    return res.status(200).json({
                        success: true,
                        error: err.stderr?.toString() || err.message,
                        output: ''
                    });
                } finally {
                    try { fs.unlinkSync(filename); } catch (e) { }
                    try { fs.unlinkSync(exeFile); } catch (e) { }
                }
                break;
            }

            default:
                return res.status(400).json({
                    success: false,
                    error: `Language not supported: ${language}`
                });
        }

        res.status(200).json({
            success: true,
            output: output || '(No output)',
            error: ''
        });

    } catch (error) {
        res.status(200).json({
            success: true,
            error: error.message,
            output: ''
        });
    }
}

// @desc    Get supported languages
// @route   GET /api/compiler/languages
// @access  Public
exports.getLanguages = async (req, res, next) => {
    try {
        const languages = Object.keys(languageMap).map(lang => ({
            id: lang,
            name: lang.charAt(0).toUpperCase() + lang.slice(1)
        }));

        res.status(200).json({
            success: true,
            languages
        });
    } catch (error) {
        next(error);
    }
};
