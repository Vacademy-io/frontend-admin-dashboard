import { create } from "zustand";

interface DialogState {
    // Dialog open states
    isPdfDialogOpen: boolean;
    isDocUploadDialogOpen: boolean;
    isVideoDialogOpen: boolean;

    // Dialog actions
    openPdfDialog: () => void;
    closePdfDialog: () => void;
    togglePdfDialog: () => void;

    openDocUploadDialog: () => void;
    closeDocUploadDialog: () => void;
    toggleDocUploadDialog: () => void;

    openVideoDialog: () => void;
    closeVideoDialog: () => void;
    toggleVideoDialog: () => void;

    // Reset all dialog states
    resetDialogs: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    // Initial states
    isPdfDialogOpen: false,
    isDocUploadDialogOpen: false,
    isVideoDialogOpen: false,

    // PDF Dialog actions
    openPdfDialog: () => set({ isPdfDialogOpen: true }),
    closePdfDialog: () => set({ isPdfDialogOpen: false }),
    togglePdfDialog: () => set((state) => ({ isPdfDialogOpen: !state.isPdfDialogOpen })),

    // Doc Upload Dialog actions
    openDocUploadDialog: () => set({ isDocUploadDialogOpen: true }),
    closeDocUploadDialog: () => set({ isDocUploadDialogOpen: false }),
    toggleDocUploadDialog: () =>
        set((state) => ({ isDocUploadDialogOpen: !state.isDocUploadDialogOpen })),

    // Video Dialog actions
    openVideoDialog: () => set({ isVideoDialogOpen: true }),
    closeVideoDialog: () => set({ isVideoDialogOpen: false }),
    toggleVideoDialog: () => set((state) => ({ isVideoDialogOpen: !state.isVideoDialogOpen })),

    // Reset all dialogs
    resetDialogs: () =>
        set({
            isPdfDialogOpen: false,
            isDocUploadDialogOpen: false,
            isVideoDialogOpen: false,
        }),
}));
