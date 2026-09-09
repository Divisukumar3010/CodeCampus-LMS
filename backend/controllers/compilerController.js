const axios = require('axios');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CodeExecutionHistory = require('../models/CodeExecutionHistory');

// Language mapping for Judge0 API (Upgraded to modern versions)
const languageMap = {
    javascript: { id: 102, name: 'JavaScript (Node.js 22.08.0)', version: 'Node.js 22' },
    python: { id: 109, name: 'Python (3.13.2)', version: '3.13.2' },
    java: { id: 91, name: 'Java (JDK 17.0.6)', version: 'JDK 17' },
    c: { id: 103, name: 'C (GCC 14.1.0)', version: 'GCC 14.1.0' },
    cpp: { id: 105, name: 'C++ (GCC 14.1.0)', version: 'GCC 14.1.0' },
    typescript: { id: 101, name: 'TypeScript (5.6.2)', version: '5.6.2' },
    html: { id: 95, name: 'HTML, CSS, JavaScript', version: 'HTML5' },
};

// Judge0 API configuration (defaults to free public endpoint if no RapidAPI key provided)
const hasRapidApiKey = process.env.JUDGE0_API_KEY && process.env.JUDGE0_API_KEY !== 'your-api-key';
const JUDGE0_API = process.env.JUDGE0_API_URL || (hasRapidApiKey ? 'https://judge0-ce.p.rapidapi.com' : 'https://ce.judge0.com');
const JUDGE0_API_KEY = hasRapidApiKey ? process.env.JUDGE0_API_KEY : null;

// Execute with Judge0
async function executeWithJudge0(code, language, input) {
    const langConfig = languageMap[language];
    if (!langConfig) {
        throw new Error(`Unsupported language for online compiler: ${language}`);
    }
    const languageId = typeof langConfig === 'object' ? langConfig.id : langConfig;
    if (!languageId) {
        throw new Error(`Unsupported language for online compiler: ${language}`);
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (JUDGE0_API_KEY) {
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
    }

    let sourceCode = code;
    let mainFilename = null;

    if (language === 'java') {
        const publicClassMatch = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
        if (publicClassMatch && publicClassMatch[1] !== 'Main') {
            const detectedName = publicClassMatch[1];
            // Normalize public class <Name> to public class Main so it works anywhere
            sourceCode = code.replace(new RegExp(`public\\s+class\\s+${detectedName}\\b`), 'public class Main');
            mainFilename = `${detectedName}.java`;
        } else {
            mainFilename = 'Main.java';
        }
    }

    const submissionData = {
        source_code: sourceCode,
        language_id: languageId,
        stdin: input || '',
        cpu_time_limit: 5,
        memory_limit: 128000
    };

    if (mainFilename) {
        submissionData.main_filename = mainFilename;
    }

    const endpoint = `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`;
    const response = await axios.post(endpoint, submissionData, {
        headers,
        timeout: 12000
    });

    const result = response.data;
    const stdout = (result.stdout || '').trim();
    const stderr = (result.stderr || '').trim();
    const compileOutput = (result.compile_output || '').trim();
    const statusDesc = result.status?.description || '';

    // If compile error or runtime error
    if (compileOutput) {
        return {
            output: '',
            error: compileOutput
        };
    }

    if (result.status?.id > 3) {
        // e.g. Time Limit Exceeded, Wrong Answer, Runtime Error
        return {
            output: stdout,
            error: stderr || statusDesc
        };
    }

    return {
        output: stdout || (stderr ? '' : '(No output)'),
        error: stderr
    };
}

// Fallback local execution when Judge0 API is unreachable
function executeLocally(code, language, input) {
    const tempDir = os.tmpdir();
    const timestamp = Date.now() + '_' + Math.floor(Math.random() * 10000);

    switch (language) {
        case 'javascript': {
            const filename = path.join(tempDir, `script_${timestamp}.js`);
            fs.writeFileSync(filename, code);
            try {
                const result = spawnSync('node', [filename], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                if (result.error) {
                    return { output: '', error: result.error.message };
                }

                const out = (result.stdout || '').trim();
                const err = (result.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(filename); } catch {}
            }
        }

        case 'python': {
            const filename = path.join(tempDir, `script_${timestamp}.py`);
            fs.writeFileSync(filename, code);
            try {
                // Try python or python3
                let result = spawnSync('python', [filename], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                if (result.error) {
                    result = spawnSync('python3', [filename], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 5000,
                        maxBuffer: 1024 * 1024
                    });
                }

                if (result.error) {
                    return { output: '', error: 'Python interpreter not found on server' };
                }

                const out = (result.stdout || '').trim();
                const err = (result.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(filename); } catch {}
            }
        }

        case 'java': {
            const classNameMatch = code.match(/public\s+class\s+(\w+)/);
            const className = classNameMatch ? classNameMatch[1] : 'Main';
            const javaFilename = path.join(tempDir, `${className}.java`);

            let finalCode = code;
            if (!classNameMatch && !code.includes('class ')) {
                finalCode = `public class Main {\n    public static void main(String[] args) {\n${code}\n    }\n}`;
            }

            fs.writeFileSync(javaFilename, finalCode);
            try {
                const compile = spawnSync('javac', [javaFilename], {
                    encoding: 'utf-8',
                    timeout: 8000
                });

                if (compile.error || compile.status !== 0) {
                    return {
                        output: '',
                        error: compile.stderr || compile.stdout || compile.error?.message || 'Java compilation failed'
                    };
                }

                const run = spawnSync('java', ['-cp', tempDir, className], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                const out = (run.stdout || '').trim();
                const err = (run.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(javaFilename); } catch {}
                try { fs.unlinkSync(path.join(tempDir, `${className}.class`)); } catch {}
            }
        }

        case 'c': {
            const cFile = path.join(tempDir, `prog_${timestamp}.c`);
            const exeFile = path.join(tempDir, `prog_${timestamp}${os.platform() === 'win32' ? '.exe' : ''}`);
            fs.writeFileSync(cFile, code);
            try {
                const compile = spawnSync('gcc', [cFile, '-o', exeFile], {
                    encoding: 'utf-8',
                    timeout: 8000
                });

                if (compile.error || compile.status !== 0) {
                    return {
                        output: '',
                        error: compile.stderr || compile.stdout || compile.error?.message || 'C compilation failed'
                    };
                }

                const run = spawnSync(exeFile, [], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                const out = (run.stdout || '').trim();
                const err = (run.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(cFile); } catch {}
                try { fs.unlinkSync(exeFile); } catch {}
            }
        }

        case 'cpp': {
            const cppFile = path.join(tempDir, `prog_${timestamp}.cpp`);
            const exeFile = path.join(tempDir, `prog_${timestamp}${os.platform() === 'win32' ? '.exe' : ''}`);
            fs.writeFileSync(cppFile, code);
            try {
                const compile = spawnSync('g++', [cppFile, '-o', exeFile], {
                    encoding: 'utf-8',
                    timeout: 8000
                });

                if (compile.error || compile.status !== 0) {
                    return {
                        output: '',
                        error: compile.stderr || compile.stdout || compile.error?.message || 'C++ compilation failed'
                    };
                }

                const run = spawnSync(exeFile, [], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                const out = (run.stdout || '').trim();
                const err = (run.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(cppFile); } catch {}
                try { fs.unlinkSync(exeFile); } catch {}
            }
        }

        case 'typescript': {
            const filename = path.join(tempDir, `script_${timestamp}.ts`);
            fs.writeFileSync(filename, code);
            try {
                // Try tsx, ts-node, or strip-types with modern node (node 22+ supports --experimental-strip-types)
                let result = spawnSync('node', ['--experimental-strip-types', filename], {
                    input: input || '',
                    encoding: 'utf-8',
                    timeout: 5000,
                    maxBuffer: 1024 * 1024
                });

                if (result.error || (result.status !== 0 && result.stderr?.includes('experimental-strip-types'))) {
                    result = spawnSync('npx', ['--yes', 'tsx', filename], {
                        input: input || '',
                        encoding: 'utf-8',
                        timeout: 8000,
                        maxBuffer: 1024 * 1024
                    });
                }

                if (result.error) {
                    return { output: '', error: result.error.message };
                }

                const out = (result.stdout || '').trim();
                const err = (result.stderr || '').trim();

                return {
                    output: out || (err ? '' : '(No output)'),
                    error: err
                };
            } finally {
                try { fs.unlinkSync(filename); } catch {}
            }
        }

        default:
            return {
                output: '',
                error: `Unsupported language: ${language}`
            };
    }
}

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

        let finalOutput = '';
        let finalError = '';
        let executionStatus = 'success';
        const startTime = Date.now();

        // For HTML, return as-is
        if (language === 'html') {
            finalOutput = code;
        } else {
            // Try Judge0 API first
            try {
                const result = await executeWithJudge0(code, language, input);
                finalOutput = result.output || '';
                finalError = result.error || '';
            } catch (apiError) {
                console.warn('Judge0 online execution failed, using local execution engine:', apiError.message);
                // Fallback to local execution
                const localResult = executeLocally(code, language, input);
                finalOutput = localResult.output || '';
                finalError = localResult.error || '';
            }
        }

        if (finalError) {
            executionStatus = 'error';
        }

        const duration = Date.now() - startTime;

        // Asynchronously save to CodeExecutionHistory
        try {
            await CodeExecutionHistory.create({
                user: req.user ? req.user.id : null,
                language,
                code,
                input: input || '',
                output: finalOutput,
                error: finalError,
                executionTime: duration,
                status: executionStatus
            });
        } catch (dbErr) {
            console.error('Failed to log code execution history:', dbErr.message);
        }

        return res.status(200).json({
            success: true,
            output: finalOutput,
            error: finalError,
            executionTime: duration
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get execution history (user-specific if logged in, or recent public/guest entries)
// @route   GET /api/compiler/history
// @access  Public (Enhanced for logged in)
exports.getExecutionHistory = async (req, res, next) => {
    try {
        const query = req.user ? { user: req.user.id } : { user: null };
        const history = await CodeExecutionHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(30)
            .select('language code input output error executionTime status createdAt');

        res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear execution history
// @route   DELETE /api/compiler/history
// @access  Public (clears own or guest history)
exports.clearExecutionHistory = async (req, res, next) => {
    try {
        const query = req.user ? { user: req.user.id } : { user: null };
        await CodeExecutionHistory.deleteMany(query);

        res.status(200).json({
            success: true,
            message: 'Execution history cleared successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get supported languages
// @route   GET /api/compiler/languages
// @access  Public
exports.getLanguages = async (req, res, next) => {
    try {
        const languages = Object.keys(languageMap).map(lang => {
            const info = languageMap[lang];
            return {
                id: lang,
                name: typeof info === 'object' ? info.name : lang.charAt(0).toUpperCase() + lang.slice(1),
                version: typeof info === 'object' ? info.version : ''
            };
        });

        res.status(200).json({
            success: true,
            languages
        });
    } catch (error) {
        next(error);
    }
};
