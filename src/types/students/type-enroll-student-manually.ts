// types/students/enroll-students-manually.ts

export interface StepOneData {
    profilePicture?: string | null | undefined; // This will now store the file ID instead of URL
    profilePictureUrl?: string | null | undefined; // For display purposes
}

export interface StepTwoData {
    fullName: string;
    enrollmentNumber: string;
    gender: string;
    collegeName: string;
    dateOfBirth?: string; // Make it optional
    accessDays: string;
}

export interface StepThreeData {
    email: string;
    mobileNumber: string;
    addressLine?: string;
    city?: string;
    state?: string;
    pincode?: string;
}

export interface StepFourData {
    fatherName: string;
    motherName: string;
    guardianMobileNumber: string;
    guardianEmail: string;
}

export interface StepFiveData {
    username: string;
    password: string;
}

export interface FormData {
    stepOneData: StepOneData | null;
    stepTwoData: StepTwoData | null;
    stepThreeData: StepThreeData | null;
    stepFourData: StepFourData | null;
    stepFiveData: StepFiveData | null;
}

export interface EnrollStudentRequest {
    formData: FormData;
    packageSessionId: string;
}
