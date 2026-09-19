import React, { useState, useRef, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import {
    Play,
    FolderOpen,
    Save,
    RotateCcw,
    History,
    ChevronDown,
    Sun,
    Moon,
    X,
    Trash2,
    Clock,
    CheckCircle2,
    AlertCircle,
    Copy,
    ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeContext } from '../context/ThemeContext';
import { compilerAPI } from '../services/api';

const LOCAL_STORAGE_HISTORY_KEY = 'codecampus_compiler_history';

const OnlineCompiler = () => {
    const [code, setCode] = useState(`console.log("Hello, World!");`);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [htmlPreview, setHtmlPreview] = useState('');
    const [editorHeight, setEditorHeight] = useState('600px');

    // History Modal state
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyList, setHistoryList] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    const editorRef = useRef(null);
    const iframeRef = useRef(null);

    // Connect to theme context
    const { isDarkMode } = useContext(ThemeContext);

    // Update editor theme when global theme changes
    useEffect(() => {
        setEditorTheme(isDarkMode ? 'vs-dark' : 'light');
    }, [isDarkMode]);

    // Handle HTML/CSS/JS preview update with debounce
    useEffect(() => {
        if (language === 'html') {
            const timer = setTimeout(() => {
                setHtmlPreview(code);
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [code, language]);

    // Responsive editor height
    useEffect(() => {
        const updateHeight = () => {
            setEditorHeight(window.innerWidth < 1024 ? '350px' : '600px');
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Load local history on mount as fallback
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setHistoryList(parsed);
                }
            }
        } catch (e) {
            console.error('Failed to parse local history', e);
        }
    }, []);

    const languages = [
        { id: 'javascript', name: 'JavaScript', version: 'Node.js 22' },
        { id: 'typescript', name: 'TypeScript', version: 'v5.6.2' },
        { id: 'python', name: 'Python', version: 'v3.13.2' },
        { id: 'java', name: 'Java', version: 'JDK 17' },
        { id: 'c', name: 'C', version: 'GCC 14.1' },
        { id: 'cpp', name: 'C++', version: 'GCC 14.1' },
        { id: 'html', name: 'HTML/CSS/JS', version: 'HTML5' },
    ];

    const templates = {
        javascript: `console.log("Hello, World!");\nconsole.log(\`Running on Node.js \${process.version}\`);`,
        typescript: `interface User {\n    name: string;\n    role: string;\n}\n\nconst user: User = {\n    name: "Developer",\n    role: "Full Stack Engineer"\n};\n\nconsole.log(\`Hello, \${user.name}! Welcome to CodeCampus (\${user.role})\`);`,
        python: `import sys\n\nprint("Hello, World!")\nprint(f"Python version: {sys.version.split()[0]}")`,
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Java Runtime: " + System.getProperty("java.version"));
    }
}`,
        c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    #ifdef __VERSION__
    printf("Compiled with GCC: %s\\n", __VERSION__);
    #endif
    return 0;
}`,
        cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    #ifdef __VERSION__
    std::cout << "Compiled with GCC: " << __VERSION__ << std::endl;
    #endif
    return 0;
}`,
        html: `<!DOCTYPE html>
<html>
<head>
    <title>Hello</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        h1 {
            color: #333;
            margin: 0;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 20px;
            font-size: 16px;
        }
        button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World!</h1>
        <button onclick="alert('Welcome to CodeCampus!')">Click Me</button>
    </div>
</body>
</html>`,
    };

    const handleEditorMount = (editor) => {
        editorRef.current = editor;
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(templates[lang] || '');
        setOutput('');
        setError('');
        setIsDropdownOpen(false);
    };

    const toggleEditorTheme = () => {
        setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark');
    };

    // Save history locally to localStorage as backup
    const saveToLocalHistory = (entry) => {
        try {
            const current = [entry, ...historyList.filter(item => item._id !== entry._id)].slice(0, 30);
            setHistoryList(current);
            localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(current));
        } catch (e) {
            console.error('Failed to save to local storage', e);
        }
    };

    const handleRun = async () => {
        setLoading(true);
        setOutput('');
        setError('');

        const startTime = Date.now();

        try {
            // For HTML, show preview directly without API call
            if (language === 'html') {
                setHtmlPreview(code);
                setLoading(false);

                const htmlEntry = {
                    _id: `local-${Date.now()}`,
                    language: 'html',
                    code,
                    input: '',
                    output: '(HTML Live Preview Rendered)',
                    error: '',
                    executionTime: Date.now() - startTime,
                    status: 'success',
                    createdAt: new Date().toISOString()
                };
                saveToLocalHistory(htmlEntry);
                return;
            }

            const response = await compilerAPI.execute({
                code,
                language,
                input,
            });

            const resOutput = response.data.output || '';
            const resError = response.data.error || '';
            const duration = response.data.executionTime || (Date.now() - startTime);

            setOutput(resOutput);
            setError(resError);

            if (!resOutput && !resError) {
                setOutput('(No output)');
            }

            // Also keep local history synchronized with real MongoDB ID if returned
            const historyEntry = response.data.historyItem || {
                _id: `exec-${Date.now()}`,
                language,
                code,
                input,
                output: resOutput,
                error: resError,
                executionTime: duration,
                status: resError ? 'error' : 'success',
                createdAt: new Date().toISOString()
            };
            saveToLocalHistory(historyEntry);

        } catch (err) {
            const errMsg = err.response?.data?.error || err.message;
            setError(errMsg);

            const failedEntry = {
                _id: `err-${Date.now()}`,
                language,
                code,
                input,
                output: '',
                error: errMsg,
                executionTime: Date.now() - startTime,
                status: 'error',
                createdAt: new Date().toISOString()
            };
            saveToLocalHistory(failedEntry);
        } finally {
            setLoading(false);
        }
    };

    // Open & fetch execution history
    const handleOpenHistory = async () => {
        setIsHistoryOpen(true);
        setHistoryLoading(true);

        try {
            const res = await compilerAPI.getHistory();
            if (res.data?.history) {
                setHistoryList(res.data.history);
                localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(res.data.history));
                setSelectedHistoryItem(res.data.history.length > 0 ? res.data.history[0] : null);
            }
        } catch (err) {
            console.warn('API history fetch fallback to local storage:', err.message);
            if (historyList.length > 0) {
                setSelectedHistoryItem(historyList[0]);
            }
        } finally {
            setHistoryLoading(false);
        }
    };

    // Restore selected history item to active editor
    const handleRestoreCode = (item) => {
        if (!item) return;
        setLanguage(item.language);
        setCode(item.code);
        if (item.input !== undefined) setInput(item.input);
        if (item.output) setOutput(item.output);
        if (item.error) setError(item.error);

        setIsHistoryOpen(false);
        toast.success(`Restored ${item.language.toUpperCase()} code from history!`);
    };

    // Delete a single execution history item
    const handleDeleteHistoryItem = async (e, itemToDelete) => {
        e.stopPropagation();
        if (!itemToDelete) return;

        const itemId = itemToDelete._id;

        // Optimistically remove from state and localStorage immediately
        const updatedList = historyList.filter(item => (item._id || item) !== itemId);
        setHistoryList(updatedList);
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updatedList));

        // Adjust selected item if the deleted one was selected
        if (selectedHistoryItem?._id === itemId) {
            setSelectedHistoryItem(updatedList.length > 0 ? updatedList[0] : null);
        }

        // Delete from database
        try {
            await compilerAPI.deleteHistoryItem(itemId);
        } catch (err) {
            console.warn('Backend history item deletion note:', err?.response?.data?.error || err.message);
        }

        toast.success('Execution entry removed');
    };

    // Clear execution history
    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear your code execution history?')) return;

        try {
            await compilerAPI.clearHistory();
        } catch (e) {
            // Ignore backend clear error if guest
        }

        setHistoryList([]);
        setSelectedHistoryItem(null);
        localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
        toast.success('Execution history cleared');
    };

    const handleOpenFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.ts,.py,.java,.c,.cpp,.html';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setCode(event.target.result);
                toast.success(`Loaded file: ${file.name}`);
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleSaveFile = () => {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            html: 'html',
        };
        const element = document.createElement('a');
        const file = new Blob([code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `code.${extensions[language] || 'txt'}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success('Code file saved!');
    };

    const handleReset = () => {
        setCode(templates[language] || '');
        setOutput('');
        setError('');
        setInput('');
        toast('Editor reset to template', { icon: '🔄' });
    };

    const selectedLanguage = languages.find(lang => lang.id === language);

    return (
        <div className={`animate-fade-up min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`} style={{ animationDuration: '0.4s' }}>
            {/* Top Control Bar */}
            <div className={`${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-md border-b sticky top-0 z-30 shadow-sm`}>
                <div className="max-w-full lg:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-extrabold gradient-text tracking-tight">
                                Online Compiler
                            </h1>
                            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-500/10 text-primary-500 border border-primary-500/20">
                                Live Execution
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                            <button
                                onClick={handleOpenFile}
                                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                                title="Open file from computer"
                            >
                                <FolderOpen size={16} />
                                <span className="hidden sm:inline">Open File</span>
                            </button>
                            <button
                                onClick={handleSaveFile}
                                className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                                title="Download code to local file"
                            >
                                <Save size={16} />
                                <span className="hidden sm:inline">Save File</span>
                            </button>
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="btn-glow flex items-center gap-2 py-2 px-4 text-sm font-semibold shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Execute code"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Play size={16} fill="white" />
                                )}
                                {loading ? 'Running...' : 'Run Code'}
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                                title="Reset editor to template"
                            >
                                <RotateCcw size={16} />
                                <span className="hidden sm:inline">Reset</span>
                            </button>
                            <button
                                onClick={handleOpenHistory}
                                className={`flex items-center gap-1.5 ${isDarkMode
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                    : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300'
                                    } px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95`}
                                title="View execution history"
                            >
                                <History size={16} />
                                <span>History</span>
                                {historyList.length > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[11px] flex items-center justify-center font-bold">
                                        {historyList.length > 9 ? '9+' : historyList.length}
                                    </span>
                                )}
                            </button>

                            {/* Language Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center gap-2 ${isDarkMode
                                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                                        : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-900'
                                        } px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all min-w-[150px] sm:min-w-[200px] justify-between border shadow-sm`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{selectedLanguage?.name}</span>
                                        {selectedLanguage?.version && (
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                                                {selectedLanguage.version}
                                            </span>
                                        )}
                                    </div>
                                    <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                                </button>

                                {isDropdownOpen && (
                                    <div className={`absolute right-0 top-full mt-1.5 w-full min-w-[220px] ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
                                        } rounded-xl border shadow-2xl z-50 overflow-hidden py-1`}>
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang.id)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${language === lang.id
                                                    ? 'bg-primary-600 text-white'
                                                    : isDarkMode
                                                        ? 'hover:bg-slate-800 text-slate-200'
                                                        : 'hover:bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <span>{lang.name}</span>
                                                {lang.version && (
                                                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono ${language === lang.id
                                                        ? 'bg-primary-700/80 text-white'
                                                        : isDarkMode
                                                            ? 'bg-slate-800 text-slate-400'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {lang.version}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="max-w-full lg:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,420px] xl:grid-cols-[1fr,520px] gap-6">
                    {/* Editor Panel */}
                    <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border shadow-md flex flex-col`}>
                        <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/60' : 'bg-gray-100/80 border-gray-200'} px-4 py-2.5 border-b flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-red-500/80' : 'bg-red-400'}`} />
                                <span className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-yellow-500/80' : 'bg-yellow-400'}`} />
                                <span className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-green-500/80' : 'bg-green-400'}`} />
                                <span className={`text-xs font-mono font-semibold ml-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {language === 'java' ? (() => {
                                        const m = code.match(/public\s+class\s+([A-Za-z0-9_$]+)/);
                                        return `${m ? m[1] : 'Main'}.java`;
                                    })() : `main.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language}`}
                                </span>
                                {selectedLanguage?.version && (
                                    <span className="text-[10px] text-emerald-500 font-mono font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-2">
                                        {selectedLanguage.version}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={toggleEditorTheme}
                                className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-200 text-slate-600'} transition-colors`}
                                title={editorTheme === 'vs-dark' ? 'Switch to Light Editor' : 'Switch to Dark Editor'}
                            >
                                {editorTheme === 'vs-dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </div>
                        <Editor
                            height={editorHeight}
                            language={language === 'cpp' ? 'cpp' : language === 'typescript' ? 'typescript' : language}
                            value={code}
                            onChange={(value) => setCode(value || '')}
                            onMount={handleEditorMount}
                            theme={editorTheme}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                tabSize: 2,
                                wordWrap: 'on',
                                formatOnPaste: true,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                padding: { top: 16 },
                            }}
                        />
                    </div>

                    {/* Right Panel */}
                    {language === 'html' ? (
                        // HTML Preview Panel
                        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border shadow-md flex flex-col`}>
                            <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/60' : 'bg-gray-100/80 border-gray-200'} px-4 py-2.5 border-b flex items-center justify-between`}>
                                <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-xs font-bold uppercase tracking-wider`}>Live Web Preview</span>
                                <span className="text-[11px] text-emerald-500 font-mono">Sandboxed</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full text-blue-400">
                                        Rendering...
                                    </div>
                                ) : (
                                    <iframe
                                        ref={iframeRef}
                                        srcDoc={htmlPreview}
                                        className="w-full border-none min-h-[350px] lg:min-h-[600px]"
                                        style={{ height: '100%' }}
                                        title="HTML Preview"
                                        sandbox="allow-scripts allow-same-origin allow-modals"
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        // Input & Output Panels
                        <div className="flex flex-col gap-6">
                            {/* Standard Input Panel */}
                            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border shadow-md flex flex-col`}>
                                <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/60' : 'bg-gray-100/80 border-gray-200'} px-4 py-2.5 border-b flex items-center justify-between`}>
                                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-xs font-bold uppercase tracking-wider`}>Standard Input (stdin)</span>
                                </div>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter program input here..."
                                    className={`flex-1 p-4 ${isDarkMode ? 'bg-slate-900 text-white placeholder:text-slate-600' : 'bg-white text-gray-900 placeholder:text-gray-400'} border-0 focus:outline-none font-mono text-sm resize-none`}
                                    style={{ minHeight: '160px' }}
                                />
                            </div>

                            {/* Execution Output Panel */}
                            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} rounded-2xl overflow-hidden border shadow-md flex flex-col`}>
                                <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/60' : 'bg-gray-100/80 border-gray-200'} px-4 py-2.5 border-b flex items-center justify-between`}>
                                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-slate-700'} text-xs font-bold uppercase tracking-wider`}>Output (stdout)</span>
                                    {loading && (
                                        <span className="text-xs text-primary-400 font-mono animate-pulse">Running execution...</span>
                                    )}
                                </div>
                                <div className="flex-1 overflow-auto p-4 font-mono text-sm space-y-3" style={{ minHeight: '220px' }}>
                                    {loading ? (
                                        <div className="text-primary-400 py-6 text-center">
                                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                            Executing code in sandbox...
                                        </div>
                                    ) : !output && !error ? (
                                        <div className={`py-8 text-center text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                            Click <span className="font-semibold text-emerald-500">Run</span> to execute your program
                                        </div>
                                    ) : (
                                        <>
                                            {output && (
                                                <div className="text-emerald-400">
                                                    <pre className="whitespace-pre-wrap break-words">{output}</pre>
                                                </div>
                                            )}
                                            {error && (
                                                <div className="text-red-400 border-t border-red-500/20 pt-2 mt-2">
                                                    <div className="text-xs font-semibold text-red-300 uppercase tracking-wider mb-1">Errors / Stack Trace:</div>
                                                    <pre className="whitespace-pre-wrap break-words text-xs">{error}</pre>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================================
                EXECUTION HISTORY MODAL
                ========================================================= */}
            {isHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className={`w-full max-w-4xl h-[85vh] ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
                        } rounded-2xl border shadow-2xl flex flex-col overflow-hidden`}>
                        {/* Modal Header */}
                        <div className={`px-5 py-4 border-b ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-100 border-gray-200'} flex items-center justify-between`}>
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-primary-500/10 text-primary-500">
                                    <History size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base sm:text-lg">Code Execution History</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Review past runs, inspect outputs, and restore past code
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {historyList.length > 0 && (
                                    <button
                                        onClick={handleClearHistory}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                                        title="Clear all execution history"
                                    >
                                        <Trash2 size={14} />
                                        Clear History
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsHistoryOpen(false)}
                                    className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-200 text-gray-500'} transition`}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[280px,1fr]">
                            {/* Left List of Executions */}
                            <div className={`border-r ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-gray-200 bg-gray-50'} overflow-y-auto p-2 space-y-1.5`}>
                                {historyLoading ? (
                                    <div className="py-12 text-center text-xs text-slate-500">
                                        Loading history...
                                    </div>
                                ) : historyList.length === 0 ? (
                                    <div className="py-12 text-center px-4">
                                        <History size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
                                        <p className="text-xs font-medium text-slate-500">No execution history yet</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Run any code in the compiler to automatically track it here.</p>
                                    </div>
                                ) : (
                                    historyList.map((item, idx) => {
                                        const isSelected = selectedHistoryItem?._id === item._id;
                                        return (
                                            <div
                                                key={item._id || idx}
                                                onClick={() => setSelectedHistoryItem(item)}
                                                className={`group relative w-full text-left p-3 rounded-xl transition-all border cursor-pointer ${isSelected
                                                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                                    : isDarkMode
                                                        ? 'bg-slate-900 hover:bg-slate-800/80 border-slate-800/80 text-slate-300'
                                                        : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-500/10 text-primary-500'
                                                        }`}>
                                                        {item.language}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        <span className={`text-[10px] flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                                            {item.status === 'error' ? (
                                                                <AlertCircle size={12} className="text-red-400" />
                                                            ) : (
                                                                <CheckCircle2 size={12} className={isSelected ? 'text-white' : 'text-emerald-500'} />
                                                            )}
                                                            {item.executionTime ? `${item.executionTime}ms` : ''}
                                                        </span>
                                                        <button
                                                            onClick={(e) => handleDeleteHistoryItem(e, item)}
                                                            className={`p-1 rounded-md transition ml-1 ${isSelected
                                                                ? 'text-white/70 hover:text-white hover:bg-white/20'
                                                                : 'text-slate-400 hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20'
                                                                }`}
                                                            title="Delete this execution"
                                                            aria-label="Delete this execution"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-mono line-clamp-1 pr-1 ${isSelected ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {item.code.slice(0, 45)}
                                                </div>
                                                <div className={`text-[10px] mt-1.5 flex items-center justify-between ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Right Preview of Selected Item */}
                            <div className="flex flex-col h-full overflow-hidden p-4 sm:p-5">
                                {selectedHistoryItem ? (
                                    <div className="flex flex-col h-full space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm uppercase px-2.5 py-1 rounded bg-primary-500/10 text-primary-500">
                                                    {selectedHistoryItem.language}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    Executed on {new Date(selectedHistoryItem.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => handleDeleteHistoryItem(e, selectedHistoryItem)}
                                                    className="p-2 rounded-lg text-xs font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 transition inline-flex items-center gap-1"
                                                    title="Delete this execution entry"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedHistoryItem.code);
                                                        toast.success('Code copied to clipboard');
                                                    }}
                                                    className={`p-2 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} transition inline-flex items-center gap-1`}
                                                    title="Copy code"
                                                >
                                                    <Copy size={14} />
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => handleRestoreCode(selectedHistoryItem)}
                                                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                                                >
                                                    <ArrowUpRight size={15} />
                                                    Restore to Editor
                                                </button>
                                            </div>
                                        </div>

                                        {/* Code Snapshot */}
                                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                                                Code Snapshot
                                            </div>
                                            <div className={`flex-1 overflow-auto rounded-xl p-3.5 font-mono text-xs ${isDarkMode ? 'bg-slate-950 text-slate-200 border border-slate-800' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}>
                                                <pre className="whitespace-pre-wrap break-words">{selectedHistoryItem.code}</pre>
                                            </div>
                                        </div>

                                        {/* Output & Error Snapshot */}
                                        <div className="h-40 overflow-hidden flex flex-col">
                                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                                <span>Recorded Result</span>
                                                <span className={`text-[11px] font-bold ${selectedHistoryItem.status === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {selectedHistoryItem.status === 'error' ? 'Failed with Errors' : 'Execution Successful'}
                                                </span>
                                            </div>
                                            <div className={`flex-1 overflow-auto rounded-xl p-3 font-mono text-xs ${isDarkMode ? 'bg-slate-950 border border-slate-800' : 'bg-gray-100 border border-gray-200'}`}>
                                                {selectedHistoryItem.output && (
                                                    <div className="text-emerald-400">
                                                        <pre className="whitespace-pre-wrap break-words">{selectedHistoryItem.output}</pre>
                                                    </div>
                                                )}
                                                {selectedHistoryItem.error && (
                                                    <div className="text-red-400">
                                                        <pre className="whitespace-pre-wrap break-words">{selectedHistoryItem.error}</pre>
                                                    </div>
                                                )}
                                                {!selectedHistoryItem.output && !selectedHistoryItem.error && (
                                                    <span className="text-slate-500 italic">(No output produced)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                                        Select an item on the left to inspect code & output
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnlineCompiler;