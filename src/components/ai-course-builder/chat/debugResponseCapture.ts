/**
 * Response capture system to avoid wasting API credits during debugging
 * This captures real API responses and allows testing with cached data
 */

export interface CapturedResponse {
    id: string;
    timestamp: Date;
    userPrompt: string;
    fullResponse: string;
    chunks: string[];
    model: string;
    duration: number;
}

class ResponseCaptureService {
    private responses: Map<string, CapturedResponse> = new Map();
    private isCapturing = false;
    private currentCapture: Partial<CapturedResponse> | null = null;

    startCapture(userPrompt: string, model: string = 'google/gemini-2.5-pro') {
        this.isCapturing = true;
        this.currentCapture = {
            id: Date.now().toString(),
            timestamp: new Date(),
            userPrompt,
            model,
            chunks: [],
            fullResponse: '',
        };
        console.log('📹 Started capturing API response for:', userPrompt.substring(0, 50));
    }

    captureChunk(chunk: string) {
        if (!this.isCapturing || !this.currentCapture) return;

        this.currentCapture.chunks = this.currentCapture.chunks || [];
        this.currentCapture.chunks.push(chunk);
        this.currentCapture.fullResponse = (this.currentCapture.fullResponse || '') + chunk;
    }

    finishCapture() {
        if (!this.isCapturing || !this.currentCapture) return null;

        const response: CapturedResponse = {
            ...this.currentCapture,
            duration: Date.now() - new Date(this.currentCapture.timestamp!).getTime(),
        } as CapturedResponse;

        this.responses.set(response.id, response);
        this.isCapturing = false;
        this.currentCapture = null;

        console.log('📹 Finished capturing response:', {
            id: response.id,
            chunks: response.chunks.length,
            responseLength: response.fullResponse.length,
            duration: response.duration,
        });

        // Save to localStorage for persistence
        this.saveToStorage();
        return response;
    }

    getCapturedResponse(id: string): CapturedResponse | undefined {
        return this.responses.get(id);
    }

    getAllResponses(): CapturedResponse[] {
        return Array.from(this.responses.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }

    getLatestResponse(): CapturedResponse | undefined {
        const all = this.getAllResponses();
        return all.length > 0 ? all[0] : undefined;
    }

    // Simulate streaming with captured response
    simulateStreaming(
        responseId: string,
        onChunk: (chunk: string) => void,
        onComplete: (fullResponse: string) => void,
        delay: number = 50
    ) {
        const response = this.getCapturedResponse(responseId);
        if (!response) {
            console.error('❌ No captured response found for ID:', responseId);
            return;
        }

        console.log('🎬 Simulating streaming for captured response:', responseId);

        let chunkIndex = 0;
        const streamChunks = () => {
            if (chunkIndex < response.chunks.length) {
                const chunk = response.chunks[chunkIndex];
                if (chunk) {
                    onChunk(chunk);
                }
                chunkIndex++;
                setTimeout(streamChunks, delay);
            } else {
                onComplete(response.fullResponse);
                console.log('✅ Simulation complete');
            }
        };

        setTimeout(streamChunks, delay);
    }

    private saveToStorage() {
        try {
            const data = Array.from(this.responses.entries());
            localStorage.setItem('ai-chat-captured-responses', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save captured responses to localStorage:', error);
        }
    }

    private loadFromStorage() {
        try {
            const data = localStorage.getItem('ai-chat-captured-responses');
            if (data) {
                const entries = JSON.parse(data);
                this.responses = new Map(
                    entries.map(([id, response]: [string, any]) => [
                        id,
                        { ...response, timestamp: new Date(response.timestamp) },
                    ])
                );
                console.log('📦 Loaded', this.responses.size, 'captured responses from storage');
            }
        } catch (error) {
            console.warn('Failed to load captured responses from localStorage:', error);
        }
    }

    clearAll() {
        this.responses.clear();
        localStorage.removeItem('ai-chat-captured-responses');
        console.log('🗑️ Cleared all captured responses');
    }

    exportResponse(id: string): string | null {
        const response = this.getCapturedResponse(id);
        if (!response) return null;

        return JSON.stringify(response, null, 2);
    }

    // Console debugging helpers
    listResponses() {
        console.table(
            this.getAllResponses().map((r) => ({
                id: r.id,
                prompt: r.userPrompt.substring(0, 50) + '...',
                chunks: r.chunks.length,
                responseLength: r.fullResponse.length,
                duration: r.duration + 'ms',
                timestamp: r.timestamp.toLocaleString(),
            }))
        );
    }
}

// Export singleton instance
export const responseCapture = new ResponseCaptureService();

// Make available globally for console debugging
if (typeof window !== 'undefined') {
    (window as any).responseCapture = responseCapture;
    (window as any).listCapturedResponses = () => responseCapture.listResponses();
    (window as any).clearCapturedResponses = () => responseCapture.clearAll();
    console.log('🔧 Debug tools available:');
    console.log('  - window.responseCapture');
    console.log('  - window.listCapturedResponses()');
    console.log('  - window.clearCapturedResponses()');
}
