import { create } from 'zustand';

interface LiveSessionStep1State {
    sessionId: string;
    setSessionId: (id: string) => void;
    clearSessionId: () => void;
}

export const useLiveSessionStore = create<LiveSessionStep1State>((set) => ({
    sessionId: '',
    setSessionId: (id: string) => set({ sessionId: id }),
    clearSessionId: () => set({ sessionId: '' }),
}));
