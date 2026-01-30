// Admission Module Types

export type AdmissionStatus =
    | 'PENDING_VERIFICATION'
    | 'DOCUMENTS_VERIFIED'
    | 'PENDING_ALLOCATION'
    | 'ALLOCATED'
    | 'PENDING_PAYMENT'
    | 'PAYMENT_COMPLETE'
    | 'ENROLLED'
    | 'REJECTED';

export interface Admission {
    id: string;
    registrationId: string;
    studentName: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    parentName: string;
    parentPhone: string;
    applyingForClass: string;
    preferredBoard: string;
    academicYear: string;
    status: AdmissionStatus;
    registrationDate: string;
    admissionDate?: string;

    // Verification
    documentsVerified: boolean;
    verificationNotes?: string;
    verifiedBy?: string;
    verifiedAt?: string;

    // Allocation
    allocatedSection?: string;
    allocatedRollNumber?: string;
    allocatedBatch?: string;
    seatConfirmed: boolean;

    // Payment
    totalFee: number;
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: 'PENDING' | 'PARTIAL' | 'COMPLETE';

    // Enrollment
    admissionNumber?: string;
    enrollmentDate?: string;
    enrolledBy?: string;
}

export interface AdmissionFilters {
    status?: AdmissionStatus;
    class?: string;
    academicYear?: string;
    dateRange?: string;
    searchQuery?: string;
}

export interface SectionAllocation {
    class: string;
    section: string;
    capacity: number;
    enrolled: number;
    available: number;
}

export interface AdmissionStats {
    totalPending: number;
    documentsVerified: number;
    allocated: number;
    paymentComplete: number;
    enrolled: number;
    rejected: number;
}
