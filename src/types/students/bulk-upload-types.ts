// types/students/bulk-upload-types.ts

export interface ErrorType {
    path: [number, string];
    message: string;
    resolution: string;
    currentVal: string;
    format: string;
}

export interface BulkUploadTableProps {
    data: SchemaFields[];
    isLoading: boolean;
    errors: ErrorType[];
    onEdit?: (rowIndex: number, columnId: string, value: string) => void;
}

// types/students/bulk-upload-types.ts
export interface SchemaFields {
    [key: string]: string | number | boolean;
}

export interface ValidationError {
    path: [number, string];
    message: string;
    resolution: string;
    currentVal: string;
    format: string;
}

export interface BulkUploadStoreState {
    csvData: SchemaFields[] | undefined;
    csvErrors: ValidationError[];
    isEditing: boolean;
    setCsvData: (data: SchemaFields[] | undefined) => void;
    setCsvErrors: (errors: ValidationError[]) => void;
    setIsEditing: (value: boolean) => void;
}

// types/students/bulk-upload-types.ts

export interface BulkUploadResponse {
    STATUS: string;
    ERROR: string;
    STATUS_MESSAGE: string;
    [key: string]: string;
}

export interface SubmitApiResponse {
    success: boolean;
    message: string;
    data: BulkUploadResponse[];
}
