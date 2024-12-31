export const BASE_URL = "https://backend-stage.vacademy.io";

export const INSTITUTE_ID = "c70f40a5-e4d3-4b6c-a498-e612d0d4b133";

// urls
export const LOGIN_URL = `${BASE_URL}/auth-service/v1/login-root`;
export const SIGNUP_URL = `${BASE_URL}/auth-service/v1/signup-root`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/auth-service/v1/refresh-token`;
export const UPLOAD_DOCS_FILE_URL = `${BASE_URL}/assessment-service/question-paper/upload/docx/v1/convert-doc-to-html`;
export const INIT_INSTITUTE = `${BASE_URL}/admin-core-service/institute/v1/details/c70f40a5-e4d3-4b6c-a498-e612d0d4b133`;
export const GET_STUDENTS = `${BASE_URL}/admin-core-service/institute/student/get/v1/all`;
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
