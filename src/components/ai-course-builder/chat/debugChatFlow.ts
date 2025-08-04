/**
 * Comprehensive debugging system for chat flow
 * Helps diagnose issues step by step
 */

export interface ChatDebugState {
    messageId: string;
    step: string;
    timestamp: Date;
    data: any;
    success: boolean;
    error?: string;
}

class ChatFlowDebugger {
    private debugLog: ChatDebugState[] = [];
    private currentMessageId: string | null = null;
    private isDebugging = false;

    startDebugging(messageId: string) {
        this.currentMessageId = messageId;
        this.isDebugging = true;
        this.log('START_DEBUG', { messageId }, true);
        console.log('🐛 Started debugging chat flow for message:', messageId);
    }

    stopDebugging() {
        this.log('STOP_DEBUG', { messageId: this.currentMessageId }, true);
        this.isDebugging = false;
        this.currentMessageId = null;
        console.log('🐛 Stopped debugging chat flow');
    }

    log(step: string, data: any, success: boolean = true, error?: string) {
        if (!this.isDebugging) return;

        const logEntry: ChatDebugState = {
            messageId: this.currentMessageId || 'unknown',
            step,
            timestamp: new Date(),
            data,
            success,
            error,
        };

        this.debugLog.push(logEntry);

        const icon = success ? '✅' : '❌';
        const errorMsg = error ? ` - ${error}` : '';
        console.log(`🐛 ${icon} [${step}]`, data, errorMsg);
    }

    // Specific debug methods for different parts of the flow
    debugMessageCreation(messageId: string, messageData: any) {
        this.log('MESSAGE_CREATION', { messageId, ...messageData }, true);
    }

    debugStreamingStart(apiRequest: any) {
        this.log(
            'STREAMING_START',
            {
                prompt: apiRequest.prompt?.substring(0, 100),
                model: apiRequest.model,
                hasAttachments: !!apiRequest.attachments?.length,
            },
            true
        );
    }

    debugChunkReceived(chunk: string, chunkIndex: number) {
        this.log(
            'CHUNK_RECEIVED',
            {
                chunkIndex,
                chunkLength: chunk.length,
                chunkPreview: chunk.substring(0, 50),
                hasData: chunk.includes('data:'),
                hasJson: chunk.includes('{') || chunk.includes('}'),
                hasThinking: chunk.includes('[Thinking...]'),
                hasGenerating: chunk.includes('[Generating...]'),
            },
            true
        );
    }

    debugSectionAdd(messageId: string, section: any, sectionsCount: number) {
        this.log(
            'SECTION_ADD',
            {
                messageId,
                sectionType: section.type,
                sectionId: section.id,
                contentPreview: section.content?.substring(0, 50),
                totalSections: sectionsCount,
            },
            true
        );
    }

    debugStateUpdate(messageId: string, sectionsInState: any[]) {
        this.log(
            'STATE_UPDATE',
            {
                messageId,
                sectionsCount: sectionsInState.length,
                sectionTypes: sectionsInState.map((s) => s.type),
                sectionIds: sectionsInState.map((s) => s.id),
            },
            sectionsInState.length > 0
        );
    }

    debugUIRender(messageId: string, sectionsReceived: any[]) {
        const success = sectionsReceived.length > 0;
        this.log(
            'UI_RENDER',
            {
                messageId,
                sectionsReceived: sectionsReceived.length,
                sectionTypes: sectionsReceived.map((s) => s.type),
                fallbackUsed: sectionsReceived.length === 0,
            },
            success,
            success ? undefined : 'No sections received - using fallback content'
        );
    }

    debugError(step: string, error: any) {
        this.log(step, { error: error.message || error }, false, error.message || String(error));
    }

    // Analysis methods
    getDebugSummary(messageId?: string): string {
        const logs = messageId
            ? this.debugLog.filter((log) => log.messageId === messageId)
            : this.debugLog;

        const summary = {
            totalSteps: logs.length,
            successfulSteps: logs.filter((log) => log.success).length,
            errors: logs.filter((log) => !log.success),
            stepCounts: logs.reduce(
                (acc, log) => {
                    acc[log.step] = (acc[log.step] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            ),
        };

        return JSON.stringify(summary, null, 2);
    }

    exportLogs(messageId?: string): string {
        const logs = messageId
            ? this.debugLog.filter((log) => log.messageId === messageId)
            : this.debugLog;

        return JSON.stringify(logs, null, 2);
    }

    clearLogs() {
        this.debugLog = [];
        console.log('🧹 Cleared debug logs');
    }

    // Console helpers
    printSummary(messageId?: string) {
        console.log('🐛 Debug Summary:', this.getDebugSummary(messageId));
    }

    printLogs(messageId?: string) {
        const logs = messageId
            ? this.debugLog.filter((log) => log.messageId === messageId)
            : this.debugLog;

        console.table(
            logs.map((log) => ({
                messageId: log.messageId,
                step: log.step,
                success: log.success ? '✅' : '❌',
                error: log.error || '',
                timestamp: log.timestamp.toLocaleTimeString(),
            }))
        );
    }

    // Automated flow analysis
    analyzeMessageFlow(messageId: string): string {
        const logs = this.debugLog.filter((log) => log.messageId === messageId);
        const analysis = [];

        // Check if message was created
        const messageCreated = logs.find((log) => log.step === 'MESSAGE_CREATION');
        if (!messageCreated) {
            analysis.push('❌ Message creation not logged');
        } else {
            analysis.push('✅ Message created successfully');
        }

        // Check if streaming started
        const streamingStarted = logs.find((log) => log.step === 'STREAMING_START');
        if (!streamingStarted) {
            analysis.push('❌ Streaming never started');
        } else {
            analysis.push('✅ Streaming started');
        }

        // Check chunks received
        const chunksReceived = logs.filter((log) => log.step === 'CHUNK_RECEIVED');
        if (chunksReceived.length === 0) {
            analysis.push('❌ No chunks received');
        } else {
            analysis.push(`✅ ${chunksReceived.length} chunks received`);
        }

        // Check sections added
        const sectionsAdded = logs.filter((log) => log.step === 'SECTION_ADD');
        if (sectionsAdded.length === 0) {
            analysis.push('❌ No sections added to state');
        } else {
            analysis.push(`✅ ${sectionsAdded.length} sections added`);
        }

        // Check UI renders
        const uiRenders = logs.filter((log) => log.step === 'UI_RENDER');
        const successfulRenders = uiRenders.filter((log) => log.success);
        if (successfulRenders.length === 0) {
            analysis.push('❌ UI never received sections - using fallback');
        } else {
            analysis.push(`✅ UI rendered sections ${successfulRenders.length} times`);
        }

        // Check for errors
        const errors = logs.filter((log) => !log.success);
        if (errors.length > 0) {
            analysis.push(`⚠️ ${errors.length} errors detected:`);
            errors.forEach((error) => {
                analysis.push(`  - ${error.step}: ${error.error}`);
            });
        }

        return analysis.join('\n');
    }
}

// Export singleton
export const chatDebugger = new ChatFlowDebugger();

// Make available globally
if (typeof window !== 'undefined') {
    (window as any).chatDebugger = chatDebugger;
    (window as any).analyzeMessageFlow = (messageId: string) => {
        console.log(chatDebugger.analyzeMessageFlow(messageId));
    };
    (window as any).printDebugSummary = () => chatDebugger.printSummary();
    (window as any).printDebugLogs = (messageId?: string) => chatDebugger.printLogs(messageId);

    console.log('🔧 Debug commands available:');
    console.log('  - window.analyzeMessageFlow(messageId)');
    console.log('  - window.printDebugSummary()');
    console.log('  - window.printDebugLogs()');
}
