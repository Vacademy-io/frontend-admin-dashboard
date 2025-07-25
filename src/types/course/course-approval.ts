// Course approval status types
export enum CourseApprovalStatus {
    DRAFT = 'DRAFT',
    IN_REVIEW = 'IN_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ACTIVE = 'ACTIVE', // Published course
    DELETED = 'DELETED',
}

// Teacher course interface
export interface TeacherCourse {
    id: string;
    packageName: string;
    status: CourseApprovalStatus;
    createdByUserId: string;
    originalCourseId?: string; // For edited courses
    parentCourseId?: string; // Reference to original published course
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    rejectionReason?: string;
    isEditable: boolean;
}

// Admin approval course interface
export interface AdminApprovalCourse {
    id: string;
    packageName: string;
    status: CourseApprovalStatus;
    createdByUserId: string;
    createdByUserName: string;
    createdByUserEmail: string;
    originalCourseId?: string;
    submittedAt: string;
    courseDepth: number;
    tags: string[];
    description: string;
}

// Course history entry
export interface CourseHistoryEntry {
    id: string;
    action: 'CREATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
    timestamp: string;
    performedBy: string;
    performedByName: string;
    reason?: string;
    courseSnapshot?: TeacherCourse;
}

// API request/response types
export interface SubmitForReviewRequest {
    courseId: string;
}

export interface SubmitForReviewResponse {
    success: boolean;
    message: string;
    courseId: string;
}

export interface CreateEditableCopyRequest {
    originalCourseId: string;
}

export interface CreateEditableCopyResponse {
    success: boolean;
    message: string;
    newCourseId: string;
    originalCourseId: string;
}

export interface WithdrawFromReviewRequest {
    courseId: string;
}

export interface WithdrawFromReviewResponse {
    success: boolean;
    message: string;
    courseId: string;
}

export interface ApproveRejectRequest {
    courseId: string;
    originalCourseId?: string; // For edited courses that have an original
    reason?: string; // Required for rejection
}

export interface ApproveRejectResponse {
    success: boolean;
    message: string;
    courseId: string;
    publishedCourseId?: string; // For approved courses
}

export interface CanEditResponse {
    canEdit: boolean;
    reason?: string;
}

export interface ApprovalSummary {
    pending_count: number;
    pending_courses: AdminApprovalCourse[];
    recent_approved_count: number;
    recent_rejected_count: number;
}

// Filter types for teacher courses
export interface TeacherCourseFilters {
    status?: CourseApprovalStatus[];
    search?: string;
    originalCourseId?: string;
}

// Filter types for admin approval
export interface AdminApprovalFilters {
    createdByUserId?: string;
    status?: CourseApprovalStatus[];
    search?: string;
    dateRange?: {
        start: string;
        end: string;
    };
}
