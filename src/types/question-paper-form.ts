export interface MyQuestionPaperFormInterface {
    questionPaperId?: string; // Optional string
    isFavourite?: boolean; // Default value: false
    title: string; // Required string
    createdOn?: Date; // Default value: current date
    yearClass: string; // Required string
    subject: string; // Required string
    questionsType: string; // Required string
    optionsType: string; // Required string
    answersType: string; // Required string
    explanationsType: string; // Required string
    fileUpload?: File; // Optional file
    questions: MyQuestion[];
}

export interface MyQuestion {
    questionId: string | undefined; // Optional string
    questionName: string; // Required string, must have at least 1 character
    explanation?: string; // Optional string
    questionType: string; // Default value: "MCQS"
    questionMark: string; // Required string
    imageDetails?: MyImageDetail[]; // Optional array of image details
    singleChoiceOptions: MySingleChoiceOption[]; // Array of single choice options
    multipleChoiceOptions: MyMultipleChoiceOption[]; // Array of multiple choice options
}

interface MyImageDetail {
    imageId?: string; // Optional string
    imageName: string; // Required string, must have at least 1 character
    imageTitle?: string; // Optional string
    imageFile: string; // Required string
    isDeleted?: boolean; // Optional boolean
}

interface MySingleChoiceOption {
    name: string; // Optional string
    isSelected?: boolean; // Optional boolean
    image: MyImage; // Required image object
}

interface MyMultipleChoiceOption {
    name: string; // Optional string
    isSelected?: boolean; // Optional boolean
    image: MyImage; // Required image object
}

interface MyImage {
    imageId?: string; // Optional string
    imageName?: string; // Optional string
    imageTitle?: string; // Optional string
    imageFile?: string; // Optional string
    isDeleted?: boolean; // Optional boolean
}

export interface MyQuestionPaperFormEditInterface {
    questionPaperId: string | undefined; // Optional string
    title: string; // Required string
    level_id?: string; // Required string
    subject_id?: string; // Required string
    questions: MyQuestion[];
}
