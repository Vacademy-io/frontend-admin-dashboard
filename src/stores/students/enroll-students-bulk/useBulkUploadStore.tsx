// updated-useBulkUploadStore.ts
import { create } from "zustand";
import { SchemaFields, ValidationError } from "@/types/students/bulk-upload-types";

interface BulkUploadStoreState {
    csvData: SchemaFields[] | undefined;
    csvErrors: ValidationError[];
    isEditing: boolean;
    setCsvData: (data: SchemaFields[] | undefined) => void;
    setCsvErrors: (errors: ValidationError[]) => void;
    setIsEditing: (value: boolean) => void;
    updateCellValue: (rowIndex: number, columnId: string, value: string) => void;
    validateRows: () => void;
}

export const useBulkUploadStore = create<BulkUploadStoreState>((set, get) => ({
    csvData: undefined,
    csvErrors: [],
    isEditing: false,
    setCsvData: (data) => set({ csvData: data }),
    setCsvErrors: (errors) => set({ csvErrors: errors }),
    setIsEditing: (value) => set({ isEditing: value }),
    updateCellValue: (rowIndex, columnId, value) => {
        const { csvData } = get();
        if (!csvData) return;

        const newData = [...csvData];
        if (newData[rowIndex]) {
            newData[rowIndex] = {
                ...newData[rowIndex],
                [columnId]: value,
            };
            set({ csvData: newData });
        }
    },
    validateRows: () => {
        // This would be implemented with validation logic
        // based on the headers and data
        // For now it's a placeholder for future implementation
    },
}));
