export const BASE_URL = "https://backend-stage.vacademy.io";

export const INSTITUTE_ID = "c70f40a5-e4d3-4b6c-a498-e612d0d4b133";

// urls
export const LOGIN_URL = `${BASE_URL}/auth-service/v1/login-root`;
export const SIGNUP_URL = `${BASE_URL}/auth-service/v1/signup-root`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/auth-service/v1/refresh-token`;
export const UPLOAD_DOCS_FILE_URL = `${BASE_URL}/assessment-service/question-paper/upload/docx/v1/convert-doc-to-html`;
export const INIT_INSTITUTE = `${BASE_URL}/admin-core-service/institute/v1/details/c70f40a5-e4d3-4b6c-a498-e612d0d4b133`;
export const GET_STUDENTS = `${BASE_URL}/admin-core-service/institute/student/get/v1/all`;
export const GET_ASSESSMENT_DETAILS = `${BASE_URL}/assessment-service/assessment/create/v1/status`;
export const GET_STUDENTS_CSV = `${BASE_URL}/admin-core-service/institute/student/get/v1/all-csv`;
export const ENROLL_STUDENT_MANUALLY = `${BASE_URL}/admin-core-service/institute/student/v1/add-student`;
export const INIT_CSV_BULK = `${BASE_URL}/admin-core-service/institute/student-bulk/v1/init-student-upload`;
export const STUDENT_UPDATE_OPERATION = `${BASE_URL}/admin-core-service/institute/student-operation/v1/update`;
export const STUDENT_CSV_UPLOAD_URL = `${BASE_URL}/admin-core-service/institute/student-bulk/v1/upload-csv`;
export const GET_QUESTION_PAPER_FILTERED_DATA = `${BASE_URL}/assessment-service/question-paper/view/v1/get-with-filters`;
export const MARK_QUESTION_PAPER_STATUS = `${BASE_URL}/assessment-service/question-paper/manage/v1/mark-status`;
export const GET_QUESTION_PAPER_BY_ID = `${BASE_URL}/assessment-service/question-paper/view/v1/get-by-id`;
export const ADD_QUESTION_PAPER = `${BASE_URL}/assessment-service/question-paper/manage/v1/add`;
export const UPDATE_QUESTION_PAPER = `${BASE_URL}/assessment-service/question-paper/manage/v1/edit`;
export const STEP1_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/basic/create/v1/submit`;
export const STEP2_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/add-questions/create/v1/submit`;
export const STEP2_QUESTIONS_URL = `${BASE_URL}/assessment-service/assessment/add-questions/create/v1/questions-of-sections`;
export const STEP3_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/add-participants/create/v1/submit`;
export const GET_SIGNED_URL = `${BASE_URL}/media-service/get-signed-url`;
export const ACKNOWLEDGE = `${BASE_URL}/media-service/acknowledge`;
export const GET_PUBLIC_URL = `${BASE_URL}/media-service/get-public-url`;
export const GET_DETAILS = `${BASE_URL}/media-service/get-details/ids`;
export const INIT_STUDY_LIBRARY = `${BASE_URL}/admin-core-service/v1/study-library/init`;
export const UPDATE_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/update-subject`;
export const ADD_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/add-subject`;
export const DELETE_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/delete-subject`;
