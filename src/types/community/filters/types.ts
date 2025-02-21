export interface Tag {
    tagId: string;
    tagSource: string;
}

export interface QuestionEntityData {
    id: string;
    textId: string;
    mediaId: string | null;
    createdAt: string;
    updatedAt: string;
    questionResponseType: string;
    questionType: string;
    accessLevel: string;
    autoEvaluationJson: string;
    evaluationType: string;
    explanationTextId: string | null;
    defaultQuestionTimeMins: number | null;
    parentRichTextId: string | null;
}

export interface QuestionPaperEntityData {
    id: string;
    title: string;
    descriptionId: string | null;
    createdOn: string;
    updatedOn: string;
    createdByUserId: string;
    access: string;
}

export interface Entity {
    entityId: string;
    entityName: "QUESTION" | "QUESTION_PAPER";
    tags: Tag[];
    entityData: QuestionEntityData | QuestionPaperEntityData;
}

// Example: Array of entities
export type EntityList = Entity[];
