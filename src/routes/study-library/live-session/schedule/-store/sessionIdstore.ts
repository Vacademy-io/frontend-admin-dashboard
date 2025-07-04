import { create } from 'zustand';

interface LiveSessionStep1State {
    sessionId: string;
    isEdit: boolean;
    setIsEdit: (isEdit: boolean) => void;
    setSessionId: (id: string) => void;
    clearSessionId: () => void;
}

export const useLiveSessionStore = create<LiveSessionStep1State>((set) => ({
    sessionId: '',
    isEdit: false,
    setIsEdit: (isEdit: boolean) => set({ isEdit: isEdit }),
    setSessionId: (id: string) => set({ sessionId: id }),
    clearSessionId: () => set({ sessionId: '' , isEdit : false}),
}));
