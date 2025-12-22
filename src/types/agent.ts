
// Request/Response Types
export interface AgentChatRequest {
    sessionId?: string;          // Optional: for continuing existing session
    instituteId: string;         // Required: current institute context
    message: string;             // Required: user's message
    model?: string;              // Optional: LLM model (default: anthropic/claude-3.5-sonnet)
    context?: AgentContext;      // Optional: additional context
}

export interface AgentContext {
    packageSessionId?: string;
    courseId?: string;
    userId?: string;
}

export interface AgentChatResponse {
    sessionId: string;
    status: 'STARTED' | 'RESUMED' | 'ERROR';
    message: string;
    timestamp: string;
    streamEndpoint: string;
}

export interface AgentRespondRequest {
    response: string;
    optionId?: string;           // When responding to specific option
}

// SSE Event Types
export type AgentEventType =
    | 'THINKING'
    | 'TOOL_CALL'
    | 'TOOL_RESULT'
    | 'MESSAGE'
    | 'AWAITING_INPUT'
    | 'COMPLETE'
    | 'ERROR'
    | 'TIMEOUT';

export interface AgentEvent {
    eventType: AgentEventType;
    sessionId: string;
    timestamp: string;

    // THINKING event
    thought?: string;

    // TOOL_CALL event
    toolName?: string;
    toolDescription?: string;
    toolArguments?: Record<string, any>;

    // TOOL_RESULT event
    toolResult?: any;
    toolSuccess?: boolean;
    toolError?: string;

    // MESSAGE event
    message?: string;

    // AWAITING_INPUT event
    question?: string;
    options?: ConfirmationOption[];

    // ERROR event
    error?: string;

    // COMPLETE event
    summary?: string;
}

export interface ConfirmationOption {
    id: string;
    label: string;
    description: string;
}

// UI State
export interface AgentState {
    sessionId: string | null;
    status: 'idle' | 'connecting' | 'processing' | 'awaiting_input' | 'complete' | 'error';
    messages: AgentMessage[];
    isStreaming: boolean;
    error: string | null;
}

export interface AgentMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    eventType?: AgentEventType;
    toolCall?: {
        name: string;
        arguments: Record<string, any>;
        result?: any;
        success?: boolean;
    };
    confirmationOptions?: ConfirmationOption[];
}

// Available LLM Models
export const AVAILABLE_MODELS = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Best for complex reasoning' },
    { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Fast and capable' },
    { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', description: 'Cost-effective' },
    { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', description: 'Good for general tasks' },
] as const;
