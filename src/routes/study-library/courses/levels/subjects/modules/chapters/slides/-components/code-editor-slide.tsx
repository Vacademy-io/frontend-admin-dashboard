import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
    Code,
    Play,
    Moon,
    Sun,
    Copy,
    Download,
    Eye,
    Edit,
    Settings,
    ChevronDown,
} from 'lucide-react';
import Editor from '@monaco-editor/react';

interface CodeEditorData {
    language: 'python' | 'javascript';
    code: string;
    theme: 'light' | 'dark';
    viewMode: 'view' | 'edit';
}

interface CodeEditorSlideProps {
    codeData?: CodeEditorData;
    isEditable: boolean;
    onDataChange?: (newData: CodeEditorData) => void;
}

const DEFAULT_CODE = {
    python: `# Welcome to Python Code Editor
print("Hello, World!")

# Try some basic operations
numbers = [1, 2, 3, 4, 5]
sum_numbers = sum(numbers)
print(f"Sum of numbers: {sum_numbers}")

# Uncomment below lines to test interactive input:
# name = input("Enter your name: ")
# print(f"Hello, {name}! Welcome to coding!")`,

    javascript: `// Welcome to JavaScript Code Editor
console.log("Hello, World!");

// Try some basic operations
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log(\`Sum of numbers: \${sum}\`);

// Example function
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Coder"));

// Uncomment below lines to test interactive input:
// const name = prompt("Enter your name:");
// console.log(\`Hello, \${name}! Welcome to coding!\`);`,
};

export const CodeEditorSlide: React.FC<CodeEditorSlideProps> = ({
    codeData,
    isEditable,
    onDataChange,
}) => {
    const editorRef = useRef<unknown>(null);
    const [currentData, setCurrentData] = useState<CodeEditorData>(() => ({
        language: codeData?.language || 'python',
        code: codeData?.code || DEFAULT_CODE.python,
        theme: codeData?.theme || 'light',
        viewMode: codeData?.viewMode || 'edit',
        ...codeData,
    }));

    // Update local state when props change (for different slides)
    useEffect(() => {
        if (codeData) {
            setCurrentData({
                ...codeData,
                language: codeData.language || 'python',
                code: codeData.code || DEFAULT_CODE[codeData.language || 'python'],
                theme: codeData.theme || 'light',
                viewMode: codeData.viewMode || 'edit',
            });
        }
    }, [codeData]);

    const [output, setOutput] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [waitingForInput, setWaitingForInput] = useState(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('editor');

    const updateData = useCallback(
        (updates: Partial<CodeEditorData>) => {
            const newData = { ...currentData, ...updates };
            setCurrentData(newData);
            if (onDataChange && isEditable) {
                onDataChange(newData);
            }
        },
        [currentData, onDataChange, isEditable]
    );

    const handleLanguageChange = useCallback(
        (language: 'python' | 'javascript') => {
            const newCode = DEFAULT_CODE[language];
            updateData({ language, code: newCode });
        },
        [updateData]
    );

    const handleThemeChange = useCallback(() => {
        const newTheme = currentData.theme === 'light' ? 'dark' : 'light';
        updateData({ theme: newTheme });
    }, [currentData.theme, updateData]);

    const handleViewModeChange = useCallback(
        (viewMode: 'view' | 'edit') => {
            updateData({ viewMode });
        },
        [updateData]
    );

    const handleCodeChange = useCallback(
        (value: string | undefined) => {
            if (value !== undefined) {
                updateData({ code: value });
            }
        },
        [updateData]
    );

    const copyCode = useCallback(() => {
        navigator.clipboard.writeText(currentData.code);
    }, [currentData.code]);

    const downloadCode = useCallback(() => {
        const extension = currentData.language === 'python' ? 'py' : 'js';
        const blob = new Blob([currentData.code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [currentData.code, currentData.language]);

    const handleInputSubmit = useCallback(() => {
        if (inputValue.trim()) {
            const userInput = inputValue.trim();
            setOutput((prev) => prev + userInput + '\n');

            // Continue Python simulation after input
            if (currentData.language === 'python') {
                setTimeout(() => {
                    setOutput(
                        (prev) =>
                            prev +
                            `Hello, ${userInput}! Welcome to coding!\nSum of numbers: 15\n\nNote: This is a Python simulation. For real Python execution, you would need a Python interpreter.`
                    );
                }, 500);
            }

            setInputValue('');
            setWaitingForInput(false);
        }
    }, [inputValue, currentData.language]);

    const runCode = useCallback(async () => {
        setIsRunning(true);
        setOutput('Running code...\n');

        // Switch to output tab with a small delay for better UX
        setTimeout(() => {
            setActiveTab('output');
        }, 100);

        try {
            if (currentData.language === 'javascript') {
                // Create a safe environment for JavaScript execution
                const originalConsoleLog = console.log;
                const logs: string[] = [];

                console.log = (...args) => {
                    logs.push(
                        args
                            .map((arg) =>
                                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                            )
                            .join(' ')
                    );
                };

                // Check if code contains prompt() before enabling input
                const codeContainsPrompt = currentData.code.includes('prompt(');
                const originalPrompt = window.prompt;

                if (codeContainsPrompt) {
                    window.prompt = (message?: string): string | null => {
                        const promptMessage = message || 'Enter input:';
                        logs.push(promptMessage);
                        setOutput(logs.join('\n') + '\n');
                        setWaitingForInput(true);

                        // Return placeholder text
                        return '[User will provide input below]';
                    };
                }

                try {
                    // Execute the code in a try-catch to handle errors
                    const func = new Function(currentData.code);
                    func();

                    // Only set final output if we're not waiting for input
                    if (!codeContainsPrompt || !waitingForInput) {
                        setOutput(
                            logs.length > 0
                                ? logs.join('\n')
                                : 'Code executed successfully (no output)'
                        );
                    }
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error ? error.message : 'Unknown error occurred';
                    setOutput(`Error: ${errorMessage}`);
                } finally {
                    console.log = originalConsoleLog;
                    if (codeContainsPrompt) {
                        window.prompt = originalPrompt;
                    }
                }
            } else {
                // For Python, check if code contains input() before showing interactive input
                const codeContainsInput = currentData.code.includes('input(');

                setOutput(`[PYTHON SIMULATION]
Running your Python code...

Hello, World!`);

                // Only simulate input prompt if code contains input()
                if (codeContainsInput) {
                    setTimeout(() => {
                        setOutput((prev) => prev + '\nEnter your name: ');
                        setWaitingForInput(true);
                    }, 1000);
                } else {
                    // Complete the simulation without input
                    setTimeout(() => {
                        setOutput(
                            (prev) =>
                                prev +
                                '\nSum of numbers: 15\n\nNote: This is a Python simulation. For real Python execution, you would need a Python interpreter.'
                        );
                    }, 1000);
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setOutput(`Error: ${errorMessage}`);
        } finally {
            setIsRunning(false);
        }
    }, [currentData]);

    const handleEditorDidMount = (editor: unknown) => {
        editorRef.current = editor;
    };

    // Add keyboard shortcut for running code
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                if (!isRunning && isEditable) {
                    runCode();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isRunning, isEditable, runCode]);

    return (
        <div className="h-full p-1">
            <Card className="h-full">
                <CardHeader className="pb-2">
                    <div className="flex flex-col items-center justify-between gap-2 lg:flex-row">
                        <CardTitle className="flex items-center gap-2">
                            <Code className="size-5" />
                            Code Editor
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs font-normal text-gray-600">
                                {currentData.viewMode === 'edit' ? 'Edit Mode' : 'View Mode'}
                            </span>
                        </CardTitle>

                        <div className="flex items-center gap-2">
                            <Button
                                onClick={runCode}
                                disabled={isRunning || !isEditable}
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <Play className="mr-1 size-4" />
                                {isRunning ? 'Running...' : 'Run'}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Settings className="mr-1 size-4" />
                                        Settings
                                        <ChevronDown className="ml-1 size-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem className="flex items-center justify-between">
                                        <span>View/Edit Mode</span>
                                        <div className="flex items-center gap-1">
                                            <Eye className="size-3" />
                                            <Switch
                                                checked={currentData.viewMode === 'edit'}
                                                onCheckedChange={(checked) =>
                                                    handleViewModeChange(checked ? 'edit' : 'view')
                                                }
                                                disabled={!isEditable}
                                            />
                                            <Edit className="size-3" />
                                        </div>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={() => handleLanguageChange('python')}
                                        disabled={!isEditable || currentData.viewMode === 'view'}
                                        className={
                                            currentData.language === 'python' ? 'bg-accent' : ''
                                        }
                                    >
                                        <span>Python</span>
                                        {currentData.language === 'python' && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() => handleLanguageChange('javascript')}
                                        disabled={!isEditable || currentData.viewMode === 'view'}
                                        className={
                                            currentData.language === 'javascript' ? 'bg-accent' : ''
                                        }
                                    >
                                        <span>JavaScript</span>
                                        {currentData.language === 'javascript' && (
                                            <span className="ml-auto">✓</span>
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        onClick={handleThemeChange}
                                        disabled={!isEditable}
                                    >
                                        {currentData.theme === 'light' ? (
                                            <>
                                                <Moon className="mr-2 size-4" />
                                                Switch to Dark Theme
                                            </>
                                        ) : (
                                            <>
                                                <Sun className="mr-2 size-4" />
                                                Switch to Light Theme
                                            </>
                                        )}
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem onClick={copyCode}>
                                        <Copy className="mr-2 size-4" />
                                        Copy Code
                                    </DropdownMenuItem>

                                    <DropdownMenuItem onClick={downloadCode}>
                                        <Download className="mr-2 size-4" />
                                        Download Code
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                        <div className="flex items-center justify-between px-6 pb-4">
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="editor">Code Editor</TabsTrigger>
                                <TabsTrigger value="output" className="relative">
                                    Output
                                    {output && !isRunning && (
                                        <span className="ml-1 inline-flex size-2 rounded-full bg-green-500"></span>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                            <div className="hidden text-sm text-gray-500 lg:inline-block">
                                Press Ctrl+Enter to run code
                            </div>
                        </div>

                        <TabsContent value="editor" className="m-0 h-[500px]">
                            <div className="h-full border-t">
                                <Editor
                                    height="100%"
                                    language={currentData.language}
                                    value={currentData.code}
                                    theme={currentData.theme === 'dark' ? 'vs-dark' : 'light'}
                                    onChange={handleCodeChange}
                                    onMount={handleEditorDidMount}
                                    options={{
                                        readOnly: !isEditable || currentData.viewMode === 'view',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        fontSize: 14,
                                        lineNumbers: 'on',
                                        roundedSelection: false,
                                        scrollbar: {
                                            verticalScrollbarSize: 8,
                                            horizontalScrollbarSize: 8,
                                        },
                                        padding: { top: 16 },
                                    }}
                                />
                            </div>
                            <div className="border-t p-4">
                                <Button
                                    onClick={runCode}
                                    disabled={isRunning || !isEditable}
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    <Play className="mr-1 size-4" />
                                    {isRunning ? 'Running...' : 'Run'}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="output" className="m-0 h-[500px]">
                            <div className="flex h-full flex-col border-t">
                                <div className="flex-1 overflow-auto bg-gray-900 p-4 font-mono text-sm text-green-400">
                                    <pre className="whitespace-pre-wrap">
                                        {output || 'Click "Run Code" to see output here...'}
                                    </pre>
                                    {waitingForInput && (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-yellow-400">{'> '}</span>
                                            <input
                                                type="text"
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleInputSubmit();
                                                    }
                                                }}
                                                className="flex-1 border-none bg-transparent text-green-400 outline-none"
                                                placeholder="Type your input and press Enter..."
                                                autoFocus
                                            />
                                        </div>
                                    )}
                                </div>
                                {waitingForInput && (
                                    <div className="border-t border-gray-700 bg-gray-800 p-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleInputSubmit}
                                                className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setWaitingForInput(false);
                                                    setInputValue('');
                                                }}
                                                className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};
