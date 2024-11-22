// src/stores/usePageStore.ts
import create from "zustand";

interface PageState {
    currentPage: {
        title: string;
        path: string | undefined;
    };
    setCurrentPage: (title: string, path: string | undefined) => void;
}

export const usePageStore = create<PageState>((set) => ({
    currentPage: {
        title: "Dashboard",
        path: "/dashboard",
    },
    setCurrentPage: (title, path) => set({ currentPage: { title, path } }),
}));
