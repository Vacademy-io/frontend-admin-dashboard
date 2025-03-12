export const BASE_URL = "https://backend-stage.vacademy.io";
export const BASE_URL_LEARNER_DASHBOARD = "https://frontend-learner-dashboard-app.pages.dev";

export const SSDC_INSTITUTE_ID = "69ca11c6-54e1-4e99-9498-50c9a4272ce6";

// urls
export const LOGIN_URL = `${BASE_URL}/auth-service/v1/login-root`;
export const SIGNUP_URL = `${BASE_URL}/auth-service/v1/signup-root`;
export const REFRESH_TOKEN_URL = `${BASE_URL}/auth-service/v1/refresh-token`;

export const UPLOAD_DOCS_FILE_URL = `${BASE_URL}/media-service/convert/doc-to-html`;

export const GET_DASHBOARD_URL = `${BASE_URL}/admin-core-service/institute/v1/get-dashboard`;
export const INIT_INSTITUTE = `${BASE_URL}/admin-core-service/institute/v1/details`;
export const GET_STUDENTS = `${BASE_URL}/admin-core-service/institute/institute_learner/get/v1/all`;
export const GET_ASSESSMENT_DETAILS = `${BASE_URL}/assessment-service/assessment/create/v1/status`;
export const GET_STUDENTS_CSV = `${BASE_URL}/admin-core-service/institute/institute_learner/get/v1/all-csv`;
export const ENROLL_STUDENT_MANUALLY = `${BASE_URL}/admin-core-service/institute/institute_learner/v1/add-institute_learner`;
export const INIT_CSV_BULK = `${BASE_URL}/admin-core-service/institute/institute_learner-bulk/v1/init-institute_learner-upload`;
export const STUDENT_UPDATE_OPERATION = `${BASE_URL}/admin-core-service/institute/institute_learner-operation/v1/update`;
export const STUDENT_CSV_UPLOAD_URL = `${BASE_URL}/admin-core-service/institute/institute_learner-bulk/v1/upload-csv`;
export const STUDENT_REPORT_URL = `${BASE_URL}/assessment-service/assessment/admin/get-student-report`;
export const STUDENT_REPORT_DETAIL_URL = `${BASE_URL}/assessment-service/admin/participants/get-report-detail`;
export const GET_INSTITUTE_USERS = `${BASE_URL}/auth-service/v1/user-roles/users-of-status`;
export const INVITE_USERS_URL = `${BASE_URL}/auth-service/v1/user-invitation/invite`;
export const DELETE_DISABLE_USER_URL = `${BASE_URL}/auth-service/v1/user-roles/update-role-status`;
export const ADD_USER_ROLES_URL = `${BASE_URL}/auth-service/v1/user-roles/add-user-roles`;
export const UPDATE_USER_INVITATION_URL = `${BASE_URL}/auth-service/v1/user-invitation/update`;
export const RESEND_INVITATION_URL = `${BASE_URL}/auth-service/v1/user-invitation/resend-invitation`;

export const GET_QUESTION_PAPER_FILTERED_DATA = `${BASE_URL}/assessment-service/question-paper/view/v1/get-with-filters`;
export const MARK_QUESTION_PAPER_STATUS = `${BASE_URL}/assessment-service/question-paper/manage/v1/mark-status`;
export const GET_QUESTION_PAPER_BY_ID = `${BASE_URL}/assessment-service/question-paper/view/v1/get-by-id`;
export const ADD_QUESTION_PAPER = `${BASE_URL}/assessment-service/question-paper/manage/v1/add`;
export const UPDATE_QUESTION_PAPER = `${BASE_URL}/assessment-service/question-paper/manage/v1/edit`;
export const STEP1_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/basic/create/v1/submit`;
export const STEP2_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/add-questions/create/v1/submit`;
export const STEP2_QUESTIONS_URL = `${BASE_URL}/assessment-service/assessment/add-questions/create/v1/questions-of-sections`;
export const STEP3_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/add-participants/create/v1/submit`;
export const STEP4_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/add-access/create/v1/submit`;
export const GET_ASSESSMENT_INIT_DETAILS = `${BASE_URL}/assessment-service/assessment/admin/assessment-admin-list-init`;
export const GET_ASSESSMENT_LISTS = `${BASE_URL}/assessment-service/assessment/admin/assessment-admin-list-filter`;
export const PUBLISH_ASSESSMENT_URL = `${BASE_URL}/assessment-service/assessment/publish/v1/`;
export const PRIVATE_ADD_QUESTIONS = `${BASE_URL}/assessment-service/question-paper/public/manage/v1/add-only-question`;
export const GET_OVERVIEW_URL = `${BASE_URL}/assessment-service/assessment/admin/get-overview`;
export const GET_LEADERBOARD_URL = `${BASE_URL}/assessment-service/assessment/admin/get-leaderboard`;
export const GET_QUESTIONS_INSIGHTS_URL = `${BASE_URL}/assessment-service/assessment/admin/get-question-insights`;
export const GET_ADMIN_PARTICIPANTS = `${BASE_URL}/assessment-service/assessment/admin-participants/all/registered-participants`;
export const GET_PARTICIPANTS_QUESTION_WISE = `${BASE_URL}/assessment-service/assessment/admin-participants/all/respondent-list`;
export const GET_REVALUATE_STUDENT_RESULT = `${BASE_URL}/assessment-service/assessment/admin/revaluate`;

export const GET_SIGNED_URL = `${BASE_URL}/media-service/get-signed-url`;
export const GET_SIGNED_URL_PUBLIC = `${BASE_URL}/media-service/public/get-signed-url`;
export const ACKNOWLEDGE = `${BASE_URL}/media-service/acknowledge`;
export const GET_PUBLIC_URL = `${BASE_URL}/media-service/get-public-url`;
export const GET_DETAILS = `${BASE_URL}/media-service/get-details/ids`;
export const ACKNOWLEDGE_FOR_PUBLIC_URL = `${BASE_URL}/media-service/acknowledge-get-details`;

export const INIT_STUDY_LIBRARY = `${BASE_URL}/admin-core-service/v1/study-library/init`;
export const GET_MODULES_WITH_CHAPTERS = `${BASE_URL}/admin-core-service/v1/study-library/modules-with-chapters`;

export const ADD_LEVEL = `${BASE_URL}/admin-core-service/level/v1/add-level`;
export const UPDATE_LEVEL = `${BASE_URL}/admin-core-service/level/v1/update-level`;
export const DELETE_LEVEL = `${BASE_URL}/admin-core-service/level/v1/delete-level`;

export const UPDATE_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/update-subject`;
export const ADD_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/add-subject`;
export const DELETE_SUBJECT = `${BASE_URL}/admin-core-service/subject/v1/delete-subject`;
export const UPDATE_SUBJECT_ORDER = `${BASE_URL}/admin-core-service/subject/v1/update-subject-order`;

export const ADD_MODULE = `${BASE_URL}/admin-core-service/subject/v1/add-module`;
export const DELETE_MODULE = `${BASE_URL}/admin-core-service/subject/v1/delete-module`;
export const UPDATE_MODULE = `${BASE_URL}/admin-core-service/subject/v1/update-module`;
export const UPDATE_MODULE_ORDER = `${BASE_URL}/admin-core-service/subject/v1/update-module-order`;

export const ADD_CHAPTER = `${BASE_URL}/admin-core-service/chapter/v1/add-chapter`;
export const DELETE_CHAPTER = `${BASE_URL}/admin-core-service/chapter/v1/delete-chapter`;
export const UPDATE_CHAPTER = `${BASE_URL}/admin-core-service/chapter/v1/update-chapter`;
export const UPDATE_CHAPTER_ORDER = `${BASE_URL}/admin-core-service/chapter/v1/update-chapter-order`;
export const COPY_CHAPTER = `${BASE_URL}/admin-core-service/chapter/v1/copy`;
export const MOVE_CHAPTER = `${BASE_URL}/admin-core-service/chapter/v1/move`;

export const ADD_COURSE = `${BASE_URL}/admin-core-service/course/v1/add-course`;
export const DELETE_COURSE = `${BASE_URL}/admin-core-service/course/v1/delete-courses`;
export const UPDATE_COURSE = `${BASE_URL}/admin-core-service/course/v1/update-course`;

export const GET_SLIDES = `${BASE_URL}/admin-core-service/slide/v1/get-slides`;
export const ADD_UPDATE_VIDEO_SLIDE = `${BASE_URL}/admin-core-service/slide/v1/add-update-video-slide`;
export const ADD_UPDATE_DOCUMENT_SLIDE = `${BASE_URL}/admin-core-service/slide/v1/add-update-document-slide`;
export const UPDATE_SLIDE_STATUS = `${BASE_URL}/admin-core-service/slide/v1/update-status`;
export const UPDATE_SLIDE_ORDER = `${BASE_URL}/admin-core-service/slide/v1/update-slide-order`;
export const GET_SLIDE_ACTIVITY = `${BASE_URL}/admin-core-service/learner-tracking/activity-log/v1/learner-activity`;
export const GET_USER_VIDEO_SLIDE_ACTIVITY_LOGS = `${BASE_URL}/admin-core-service/learner-tracking/v1/get-learner-video-activity-logs`;
export const GET_USER_DOC_SLIDE_ACTIVITY_LOGS = `${BASE_URL}/admin-core-service/learner-tracking/v1/get-learner-document-activity-logs`;
export const GET_STUDENT_SUBJECT_PROGRESS = `${BASE_URL}/admin-core-service/subject/learner/v1/subjects`;
export const GET_STUDENT_SLIDE_PROGRESS = `${BASE_URL}/admin-core-service/slide/institute-learner/v1/get-slides-with-status`;

export const PDF_WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export const INIT_FILTERS = `${BASE_URL}/community-service/init/question-filters`;
export const GET_QUESTION_PAPER_FILTERED_DATA_PUBLIC = `${BASE_URL}/assessment-service/question-paper/public/view/v1/get-with-filters`;
export const GET_FILTERED_ENTITY_DATA = `${BASE_URL}/community-service/get-entity`;
export const GET_TAGS_BY_QUESTION_PAPER_ID = `${BASE_URL}/community-service/get-tags`;
export const ADD_PUBLIC_QUESTION_PAPER_TO_PRIVATE_INSTITUTE = `${BASE_URL}/assessment-service/question-paper/manage/v1/add-public-to-private`;
