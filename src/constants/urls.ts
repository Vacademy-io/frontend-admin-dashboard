const BASE_URL = "https://backend-stage.vacademy.io";

export const INSTITUTE_ID = "c70f40a5-e4d3-4b6c-a498-e612d0d4b133";

// urls
export const LOGIN_URL = `${BASE_URL}/auth-service/v1/login-root`;
export const SIGNUP_URL = `${BASE_URL}/auth-service/v1/signup-root`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/auth-service/v1/refresh-token`;
export const INIT_INSTITUTE = `${BASE_URL}/admin-core-service/institute/v1/details/c70f40a5-e4d3-4b6c-a498-e612d0d4b133`;
export const GET_STUDENTS = `${BASE_URL}/admin-core-service/institute/student/get/v1/all`;
export const ENROLL_STUDENT_MANUALLY = `${BASE_URL}/admin-core-service/institute/student/v1/add-student`;
export const INIT_CSV_BULK = `${BASE_URL}/admin-core-service/institute/student-bulk/v1/init-student-upload`;
export const STUDENT_UPDATE_OPERATION = `${BASE_URL}/admin-core-service/institute/student-operation/v1/update`;
