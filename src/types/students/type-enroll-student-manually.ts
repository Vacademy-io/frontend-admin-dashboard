import { StepOneData } from "./schema-enroll-students-manually";
import { StepTwoData } from "./schema-enroll-students-manually";
import { StepThreeData } from "./schema-enroll-students-manually";
import { StepFourData } from "./schema-enroll-students-manually";
import { StepFiveData } from "./schema-enroll-students-manually";

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
