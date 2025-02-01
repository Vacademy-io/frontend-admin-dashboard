export interface StudentDetailsQuestion {
    userId: string;
    name: string;
    batch?: string;
    enrollmentNumber?: string;
    gender: string;
    responseTime: number;
}

export interface ResponseQuestionList {
    type: string;
    studentDetails: StudentDetailsQuestion[];
}

export interface StudentDetailsAttemptedOpen {
    userId: string;
    name: string;
    batch?: string;
    enrollmentNumber?: string;
    gender: string;
    attemptDate?: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    scoredMarks?: number;
    totalMarks?: number;
    phoneNo?: string;
    email?: string;
    city?: string;
    state?: string;
}

export interface StudentDetailsPendingOpen {
    userId: string;
    name: string;
    batch?: string;
    enrollmentNumber?: string;
    gender: string;
    phoneNo: string;
    email: string;
    city: string;
    state: string;
}

export interface StudentDetailsOngoingOpen {
    userId: string;
    name: string;
    batch?: string;
    enrollmentNumber?: string;
    gender: string;
    startTime: string;
}

interface StudentsData {
    type: string;
    studentDetails:
        | StudentDetailsAttemptedOpen[]
        | StudentDetailsPendingOpen[]
        | StudentDetailsOngoingOpen[];
}

export interface ResponseQuestionListOpen {
    participantsType: string;
    studentsData: StudentsData[];
}

export interface StudentDetailsAttemptedClose {
    userId: string;
    name: string;
    batch: string;
    enrollmentNumber: string;
    gender: string;
    attemptDate: string;
    startTime: string;
    endTime: string;
    duration: number;
    scoredMarks: number;
    totalMarks: number;
}

export interface StudentDetailsPendingClose {
    userId: string;
    name: string;
    batch: string;
    enrollmentNumber: string;
    gender: string;
    phoneNo: string;
    email: string;
    city: string;
    state: string;
}

export interface StudentDetailsOngoingClose {
    userId: string;
    name: string;
    batch: string;
    enrollmentNumber: string;
    gender: string;
    startTime: string;
}

export interface ResponseQuestionListClose {
    type: string;
    studentDetails:
        | StudentDetailsAttemptedClose[]
        | StudentDetailsPendingClose[]
        | StudentDetailsOngoingClose[];
}
