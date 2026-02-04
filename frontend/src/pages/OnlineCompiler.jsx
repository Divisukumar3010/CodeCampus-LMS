import React, { useState, useRef, useEffect, useContext } from 'react';
import Editor from '@monaco-editor/react';
import { Play, FolderOpen, Save, RotateCcw, History, ChevronDown, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

const OnlineCompiler = () => {
    const [code, setCode] = useState(`console.log("Hello, World!");`);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('output');
    const editorRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Connect to your theme context
    const { isDarkMode } = useContext(ThemeContext);

    // Update editor theme when global theme changes
    useEffect(() => {
        setEditorTheme(isDarkMode ? 'vs-dark' : 'light');
    }, [isDarkMode]);

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'python', name: 'Python (3.10.0)' },
        { id: 'java', name: 'Java' },
        { id: 'c', name: 'C' },
        { id: 'cpp', name: 'C++' },
        { id: 'rust', name: 'Rust' },
        { id: 'csharp', name: 'C#' },
        { id: 'html', name: 'HTML' },
    ];

    const templates = {
        javascript: `console.log("Hello, World!");`,
        python: `print("Hello, World!")`,
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
        c: `#include <stdio.h>
int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
        cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
        rust: `fn main() {
    println!("Hello, World!");
}`,
        csharp: `using System;
class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
        html: `<!DOCTYPE html>
<html>
<head>
    <title>Hello</title>
</head>
<body>
    <h1>Hello, World!</h1>
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

    const handleRun = async () => {
        setLoading(true);
        setOutput('');
        setError('');
        setActiveTab('output');

        try {
            const response = await axios.post(`${API_URL}/compiler/execute`, {
                code,
                language,
                input,
            });

            if (response.data.error) {
                setError(response.data.error);
            } else {
                setOutput(response.data.output || '(No output)');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.js,.py,.java,.c,.cpp,.rs,.cs,.html';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setCode(event.target.result);
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleSaveFile = () => {
        const extensions = {
            javascript: 'js',
            python: 'py',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            rust: 'rs',
            csharp: 'cs',
            html: 'html',
        };
        const element = document.createElement('a');
        const file = new Blob([code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `code.${extensions[language]}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleReset = () => {
        setCode(templates[language]);
        setOutput('');
        setError('');
        setInput('');
    };

    const selectedLanguage = languages.find(lang => lang.id === language);

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`} style={{ marginTop: '40px' }}>
            {/* Top Control Bar */}
            <div className={`${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b`}>
                <div className="max-w-[1800px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Code Editor</h1>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleOpenFile}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <FolderOpen size={18} />
                                Open File
                            </button>
                            <button
                                onClick={handleSaveFile}
                                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Save size={18} />
                                Save File
                            </button>
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Play size={18} fill="white" />
                                Run
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <RotateCcw size={18} />
                                Reset
                            </button>
                            <button
                                className={`flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} px-5 py-2.5 rounded-lg font-medium transition-colors`}
                            >
                                <History size={18} />
                                History
                            </button>

                            {/* Language Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-100 hover:bg-gray-200 border-gray-300'} px-5 py-2.5 rounded-lg font-medium transition-colors min-w-[180px] justify-between border`}
                                >
                                    <span>{selectedLanguage?.name}</span>
                                    <ChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} size={18} />
                                </button>

                                {isDropdownOpen && (
                                    <div className={`absolute right-0 top-full mt-2 w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg border shadow-2xl z-50 overflow-hidden`}>
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.id}
                                                onClick={() => handleLanguageChange(lang.id)}
                                                className={`w-full text-left px-5 py-2.5 transition-colors ${language === lang.id
                                                        ? 'bg-purple-600/30 text-purple-400'
                                                        : isDarkMode
                                                            ? 'hover:bg-gray-700'
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                            >
                                                {lang.name}
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
            <div className="max-w-[1800px] mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,500px] gap-6">
                    {/* Editor */}
                    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-lg overflow-hidden border`}>
                        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} px-4 py-2.5 border-b flex items-center justify-between`}>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Source</span>
                            <button
                                onClick={toggleEditorTheme}
                                className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
                                title={editorTheme === 'vs-dark' ? 'Switch to Light Editor' : 'Switch to Dark Editor'}
                            >
                                {editorTheme === 'vs-dark' ? <Sun size={16} /> : <Moon size={16} />}
                            </button>
                        </div>
                        <Editor
                            height="600px"
                            language={language === 'cpp' ? 'cpp' : language === 'csharp' ? 'csharp' : language}
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

                    {/* Input/Output Panel */}
                    <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'} rounded-lg overflow-hidden border flex flex-col`}>
                        {/* Tabs */}
                        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b flex`}>
                            <button
                                onClick={() => setActiveTab('input')}
                                className={`px-6 py-2.5 font-medium transition-colors border-b-2 ${activeTab === 'input'
                                        ? `border-purple-500 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`
                                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                                    }`}
                            >
                                Input
                            </button>
                            <button
                                onClick={() => setActiveTab('output')}
                                className={`px-6 py-2.5 font-medium transition-colors border-b-2 ${activeTab === 'output'
                                        ? `border-purple-500 ${isDarkMode ? 'text-white bg-gray-900' : 'text-gray-900 bg-white'}`
                                        : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
                                    }`}
                            >
                                Output
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden">
                            {activeTab === 'input' ? (
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter input here (if your program requires it)..."
                                    className={`w-full h-full p-4 ${isDarkMode ? 'bg-gray-900 text-white placeholder:text-gray-500' : 'bg-white text-gray-900 placeholder:text-gray-400'} border-0 focus:outline-none font-mono text-sm resize-none`}
                                    style={{ minHeight: '600px' }}
                                />
                            ) : (
                                <div className="p-4 font-mono text-sm h-full overflow-auto" style={{ minHeight: '600px' }}>
                                    {loading ? (
                                        <div className="text-blue-400">Executing code...</div>
                                    ) : error ? (
                                        <div className="text-red-400">
                                            <pre className="whitespace-pre-wrap break-words">{error}</pre>
                                        </div>
                                    ) : output ? (
                                        <div className="text-green-400">
                                            <pre className="whitespace-pre-wrap break-words">{output}</pre>
                                        </div>
                                    ) : (
                                        <div className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Click "Run" to see output</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnlineCompiler;