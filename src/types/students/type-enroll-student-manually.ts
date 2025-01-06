// types/students/enroll-students-manually.ts

export interface StepOneData {
    profilePicture?: null;
}

export interface StepTwoData {
    fullName: string;
    enrollmentNumber: string;
    gender: string;
    collegeName: string;
    dateOfBirth?: string; // Make it optional
}

export interface StepThreeData {
    email: string;
    city: string;
    mobileNumber: string;
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
