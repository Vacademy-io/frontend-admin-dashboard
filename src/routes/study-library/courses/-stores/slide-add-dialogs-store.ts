import { create } from 'zustand';

interface DialogState {
    isPdfDialogOpen: boolean;
    isDocUploadDialogOpen: boolean;
    isVideoDialogOpen: boolean;
    isVideoFileDialogOpen: boolean; // Add new state for video file upload
    isQuestionDialogOpen: boolean;

    openPdfDialog: () => void;
    closePdfDialog: () => void;
    openDocUploadDialog: () => void;
    closeDocUploadDialog: () => void;
    openVideoDialog: () => void;
    closeVideoDialog: () => void;
    openVideoFileDialog: () => void; // Add new action for video file upload
    closeVideoFileDialog: () => void; // Add new action for video file upload
    openQuestionDialog: () => void;
    closeQuestionDialog: () => void;
}

export const useDialogStore = create<DialogState>((set) => ({
    isPdfDialogOpen: false,
    isDocUploadDialogOpen: false,
    isVideoDialogOpen: false,
    isVideoFileDialogOpen: false, // Initialize new state
    isQuestionDialogOpen: false,

    openPdfDialog: () => set({ isPdfDialogOpen: true }),
    closePdfDialog: () => set({ isPdfDialogOpen: false }),
    openDocUploadDialog: () => set({ isDocUploadDialogOpen: true }),
    closeDocUploadDialog: () => set({ isDocUploadDialogOpen: false }),
    openVideoDialog: () => set({ isVideoDialogOpen: true }),
    closeVideoDialog: () => set({ isVideoDialogOpen: false }),
    openVideoFileDialog: () => set({ isVideoFileDialogOpen: true }), // Implement new action
    closeVideoFileDialog: () => set({ isVideoFileDialogOpen: false }), // Implement new action
    openQuestionDialog: () => set({ isQuestionDialogOpen: true }),
    closeQuestionDialog: () => set({ isQuestionDialogOpen: false }),
}));
