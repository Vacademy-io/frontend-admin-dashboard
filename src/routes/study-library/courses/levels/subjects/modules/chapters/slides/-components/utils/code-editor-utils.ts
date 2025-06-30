import axios from 'axios';
import { SupportedLanguage, DEFAULT_CODE } from '../constants/code-editor';
import { CodeEditorData, AllLanguagesData } from './code-editor-types';

export interface CodeExecutionResult {
    output: string;
    needsInput: boolean;
}

/**
 * Get the current code from the Monaco editor
 */
export const getCurrentCodeFromEditor = (editorRef: React.RefObject<unknown>): string => {
    if (
        editorRef.current &&
        typeof editorRef.current === 'object' &&
        'getValue' in editorRef.current
    ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (editorRef.current as any).getValue() || '';
    }
    return '';
};

/**
 * Copy code to clipboard
 */
export const copyCodeToClipboard = (code: string): void => {
    navigator.clipboard.writeText(code);
};

/**
 * Download code as a file
 */
export const downloadCodeAsFile = (code: string, language: SupportedLanguage): void => {
    const extension = language === 'python' ? 'py' : 'js';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const executeCodeWithPiston = async (code: string, language: string) => {
    const PISTONAPI = 'https://emkc.org/api/v2/piston/execute';
    try {
        const response = await axios({
            method: 'POST',
            url: PISTONAPI,
            data: {
                language: language,
                version: '*',
                files: [
                    {
                        content: code,
                    },
                ],
            },
        });

        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.data;

        // Extract output from the response
        let output = '';
        let hasError = false;

        // Check for compilation stage (for languages that need it)
        if (result.compile) {
            console.log('[CodeEditor] Compile stage:', result.compile);
            if (result.compile.code !== 0) {
                // Compilation error
                output =
                    'Compilation Error:\n' +
                    (result.compile.stderr || result.compile.output || 'Unknown compilation error');
                hasError = true;
            }
        }

        // Check for runtime stage
        if (result.run) {
            console.log('[CodeEditor] Run stage:', result.run);
            if (result.run.code !== 0) {
                // Runtime error
                output =
                    'Runtime Error:\n' +
                    (result.run.stderr || result.run.output || 'Unknown runtime error');
                hasError = true;
            } else {
                // Successful execution
                output = result.run.output || result.run.stdout || '';
                if (result.run.stderr && result.run.stderr.trim()) {
                    output += '\nWarnings:\n' + result.run.stderr;
                }
            }
        } else {
            output = 'No execution result received';
            hasError = true;
        }

        // Check if code contains input() - this is a limitation for now
        const needsInput = code.includes('input(') && !hasError;
        if (needsInput) {
            output += '\n\nNote: Interactive input is not supported in this online environment.';
        }

        return {
            output: output.trim() || 'Code executed successfully (no output)',
            needsInput: false, // We don't support interactive input with Piston
            hasError,
        };
    } catch (error) {
        console.error('[CodeEditor] Error executing code with Piston:', error);

        // Fallback error message
        return {
            output: `Execution Error: ${
                error instanceof Error ? error.message : 'Unknown error'
            }\n\nPlease check your code and try again.`,
            needsInput: false,
            hasError: true,
        };
    }
};

/**
 * Execute code using Piston API
 */
export const executeCode = async (
    code: string,
    language: SupportedLanguage
): Promise<CodeExecutionResult> => {
    if (!code.trim()) {
        return {
            output: 'No code to execute. Please write some code first.',
            needsInput: false,
        };
    }

    try {
        const result = await executeCodeWithPiston(code, language);
        return {
            output: result.output,
            needsInput: result.needsInput,
        };
    } catch (error) {
        console.error('[CodeEditor] Failed to execute code:', error);
        return {
            output: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            needsInput: false,
        };
    }
};

/**
 * Handle user input submission during code execution
 */
export const handleUserInputSubmission = (
    userInput: string,
    language: SupportedLanguage,
    currentOutput: string
): string => {
    if (!userInput.trim()) {
        return currentOutput;
    }

    const trimmedInput = userInput.trim();
    let newOutput = currentOutput + trimmedInput + '\n';

    // Continue Python simulation after input
    if (language === 'python') {
        newOutput += `Hello, ${trimmedInput}! Welcome to coding!\nSum of numbers: 15\n\nNote: This is a Python simulation. For real Python execution, you would need a Python interpreter.`;
    }

    return newOutput;
};

/**
 * Setup keyboard shortcuts for the code editor
 */
export const setupKeyboardShortcuts = (
    onRunCode: () => void,
    isRunning: boolean,
    isEditable: boolean
): (() => void) => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            if (!isRunning && isEditable) {
                onRunCode();
            }
        }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Return cleanup function
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
};

/**
 * Initialize language states based on code data
 */
export const initializeLanguageStates = (codeData?: CodeEditorData): AllLanguagesData => {
    // If we have allLanguagesData from the server, use that
    if (codeData?.allLanguagesData) {
        return {
            python: {
                code: codeData.allLanguagesData.python.code || DEFAULT_CODE.python,
                lastEdited: codeData.allLanguagesData.python.lastEdited,
            },
            javascript: {
                code: codeData.allLanguagesData.javascript.code || DEFAULT_CODE.javascript,
                lastEdited: codeData.allLanguagesData.javascript.lastEdited,
            },
        };
    }

    // Fallback to legacy single-language data structure
    const currentLanguage = codeData?.language as SupportedLanguage;
    const currentCode = codeData?.code;

    return {
        python: {
            code:
                currentLanguage === 'python'
                    ? currentCode || DEFAULT_CODE.python
                    : DEFAULT_CODE.python,
            lastEdited: currentLanguage === 'python' ? Date.now() : undefined,
        },
        javascript: {
            code:
                currentLanguage === 'javascript'
                    ? currentCode || DEFAULT_CODE.javascript
                    : DEFAULT_CODE.javascript,
            lastEdited: currentLanguage === 'javascript' ? Date.now() : undefined,
        },
    };
};

/**
 * Initialize current data state based on language states and code data
 */
export const initializeCurrentData = (
    codeData: CodeEditorData | undefined,
    languageStates: AllLanguagesData
): CodeEditorData => {
    const defaultLanguage = (codeData?.language as SupportedLanguage) || 'python';
    return {
        language: defaultLanguage,
        code: languageStates[defaultLanguage].code,
        theme: codeData?.theme || 'light',
        viewMode: codeData?.viewMode || 'edit',
    };
};
