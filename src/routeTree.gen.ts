/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from "./routes/__root"
import { Route as StudyLibraryIndexImport } from "./routes/study-library/index"
import { Route as StudentsIndexImport } from "./routes/students/index"
import { Route as LoginIndexImport } from "./routes/login/index"
import { Route as DashboardIndexImport } from "./routes/dashboard/index"
import { Route as AssessmentIndexImport } from "./routes/assessment/index"
import { Route as StudyLibraryClassIndexImport } from "./routes/study-library/$class/index"
import { Route as StudentsStudentsListIndexImport } from "./routes/students/students-list/index"
import { Route as LoginForgotPasswordIndexImport } from "./routes/login/forgot-password/index"
import { Route as AssessmentTestsIndexImport } from "./routes/assessment/tests/index"
import { Route as AssessmentQuestionPapersIndexImport } from "./routes/assessment/question-papers/index"
import { Route as AssessmentExamIndexImport } from "./routes/assessment/exam/index"
import { Route as StudyLibraryClassSubjectIndexImport } from "./routes/study-library/$class/$subject/index"
import { Route as AssessmentTestsCreateAssessmentIndexImport } from "./routes/assessment/tests/create-assessment/index"
import { Route as StudyLibraryClassSubjectModuleIndexImport } from "./routes/study-library/$class/$subject/$module/index"
import { Route as AssessmentCreateAssessmentAssessmentIdExamtypeIndexImport } from "./routes/assessment/create-assessment/$assessmentId/$examtype/index"
import { Route as StudyLibraryClassSubjectModuleChapterIndexImport } from "./routes/study-library/$class/$subject/$module/$chapter/index"
import { Route as AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexImport } from "./routes/assessment/exam/assessment-details/$assessmentId/$examType/index"

// Create/Update Routes

const StudyLibraryIndexRoute = StudyLibraryIndexImport.update({
  id: "/study-library/",
  path: "/study-library/",
  getParentRoute: () => rootRoute,
} as any)

const StudentsIndexRoute = StudentsIndexImport.update({
  id: "/students/",
  path: "/students/",
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexRoute = LoginIndexImport.update({
  id: "/login/",
  path: "/login/",
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: "/dashboard/",
  path: "/dashboard/",
  getParentRoute: () => rootRoute,
} as any)

const AssessmentIndexRoute = AssessmentIndexImport.update({
  id: "/assessment/",
  path: "/assessment/",
  getParentRoute: () => rootRoute,
} as any)

const StudyLibraryClassIndexRoute = StudyLibraryClassIndexImport.update({
  id: "/study-library/$class/",
  path: "/study-library/$class/",
  getParentRoute: () => rootRoute,
} as any)

const StudentsStudentsListIndexRoute = StudentsStudentsListIndexImport.update({
  id: "/students/students-list/",
  path: "/students/students-list/",
  getParentRoute: () => rootRoute,
} as any)

const LoginForgotPasswordIndexRoute = LoginForgotPasswordIndexImport.update({
  id: "/login/forgot-password/",
  path: "/login/forgot-password/",
  getParentRoute: () => rootRoute,
} as any)

const AssessmentTestsIndexRoute = AssessmentTestsIndexImport.update({
  id: "/assessment/tests/",
  path: "/assessment/tests/",
  getParentRoute: () => rootRoute,
} as any)

const AssessmentQuestionPapersIndexRoute =
  AssessmentQuestionPapersIndexImport.update({
    id: "/assessment/question-papers/",
    path: "/assessment/question-papers/",
    getParentRoute: () => rootRoute,
  } as any)

const AssessmentExamIndexRoute = AssessmentExamIndexImport.update({
  id: "/assessment/exam/",
  path: "/assessment/exam/",
  getParentRoute: () => rootRoute,
} as any)

const StudyLibraryClassSubjectIndexRoute =
  StudyLibraryClassSubjectIndexImport.update({
    id: "/study-library/$class/$subject/",
    path: "/study-library/$class/$subject/",
    getParentRoute: () => rootRoute,
  } as any)

const AssessmentTestsCreateAssessmentIndexRoute =
  AssessmentTestsCreateAssessmentIndexImport.update({
    id: "/assessment/tests/create-assessment/",
    path: "/assessment/tests/create-assessment/",
    getParentRoute: () => rootRoute,
  } as any)

const StudyLibraryClassSubjectModuleIndexRoute =
  StudyLibraryClassSubjectModuleIndexImport.update({
    id: "/study-library/$class/$subject/$module/",
    path: "/study-library/$class/$subject/$module/",
    getParentRoute: () => rootRoute,
  } as any)

const AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute =
  AssessmentCreateAssessmentAssessmentIdExamtypeIndexImport.update({
    id: "/assessment/create-assessment/$assessmentId/$examtype/",
    path: "/assessment/create-assessment/$assessmentId/$examtype/",
    getParentRoute: () => rootRoute,
  } as any)

const StudyLibraryClassSubjectModuleChapterIndexRoute =
  StudyLibraryClassSubjectModuleChapterIndexImport.update({
    id: "/study-library/$class/$subject/$module/$chapter/",
    path: "/study-library/$class/$subject/$module/$chapter/",
    getParentRoute: () => rootRoute,
  } as any)

const AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute =
  AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexImport.update({
    id: "/assessment/exam/assessment-details/$assessmentId/$examType/",
    path: "/assessment/exam/assessment-details/$assessmentId/$examType/",
    getParentRoute: () => rootRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/assessment/": {
      id: "/assessment/"
      path: "/assessment"
      fullPath: "/assessment"
      preLoaderRoute: typeof AssessmentIndexImport
      parentRoute: typeof rootRoute
    }
    "/dashboard/": {
      id: "/dashboard/"
      path: "/dashboard"
      fullPath: "/dashboard"
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
    "/login/": {
      id: "/login/"
      path: "/login"
      fullPath: "/login"
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
    "/students/": {
      id: "/students/"
      path: "/students"
      fullPath: "/students"
      preLoaderRoute: typeof StudentsIndexImport
      parentRoute: typeof rootRoute
    }
    "/study-library/": {
      id: "/study-library/"
      path: "/study-library"
      fullPath: "/study-library"
      preLoaderRoute: typeof StudyLibraryIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/exam/": {
      id: "/assessment/exam/"
      path: "/assessment/exam"
      fullPath: "/assessment/exam"
      preLoaderRoute: typeof AssessmentExamIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/question-papers/": {
      id: "/assessment/question-papers/"
      path: "/assessment/question-papers"
      fullPath: "/assessment/question-papers"
      preLoaderRoute: typeof AssessmentQuestionPapersIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/tests/": {
      id: "/assessment/tests/"
      path: "/assessment/tests"
      fullPath: "/assessment/tests"
      preLoaderRoute: typeof AssessmentTestsIndexImport
      parentRoute: typeof rootRoute
    }
    "/login/forgot-password/": {
      id: "/login/forgot-password/"
      path: "/login/forgot-password"
      fullPath: "/login/forgot-password"
      preLoaderRoute: typeof LoginForgotPasswordIndexImport
      parentRoute: typeof rootRoute
    }
    "/students/students-list/": {
      id: "/students/students-list/"
      path: "/students/students-list"
      fullPath: "/students/students-list"
      preLoaderRoute: typeof StudentsStudentsListIndexImport
      parentRoute: typeof rootRoute
    }
    "/study-library/$class/": {
      id: "/study-library/$class/"
      path: "/study-library/$class"
      fullPath: "/study-library/$class"
      preLoaderRoute: typeof StudyLibraryClassIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/tests/create-assessment/": {
      id: "/assessment/tests/create-assessment/"
      path: "/assessment/tests/create-assessment"
      fullPath: "/assessment/tests/create-assessment"
      preLoaderRoute: typeof AssessmentTestsCreateAssessmentIndexImport
      parentRoute: typeof rootRoute
    }
    "/study-library/$class/$subject/": {
      id: "/study-library/$class/$subject/"
      path: "/study-library/$class/$subject"
      fullPath: "/study-library/$class/$subject"
      preLoaderRoute: typeof StudyLibraryClassSubjectIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/create-assessment/$assessmentId/$examtype/": {
      id: "/assessment/create-assessment/$assessmentId/$examtype/"
      path: "/assessment/create-assessment/$assessmentId/$examtype"
      fullPath: "/assessment/create-assessment/$assessmentId/$examtype"
      preLoaderRoute: typeof AssessmentCreateAssessmentAssessmentIdExamtypeIndexImport
      parentRoute: typeof rootRoute
    }
    "/study-library/$class/$subject/$module/": {
      id: "/study-library/$class/$subject/$module/"
      path: "/study-library/$class/$subject/$module"
      fullPath: "/study-library/$class/$subject/$module"
      preLoaderRoute: typeof StudyLibraryClassSubjectModuleIndexImport
      parentRoute: typeof rootRoute
    }
    "/assessment/exam/assessment-details/$assessmentId/$examType/": {
      id: "/assessment/exam/assessment-details/$assessmentId/$examType/"
      path: "/assessment/exam/assessment-details/$assessmentId/$examType"
      fullPath: "/assessment/exam/assessment-details/$assessmentId/$examType"
      preLoaderRoute: typeof AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexImport
      parentRoute: typeof rootRoute
    }
    "/study-library/$class/$subject/$module/$chapter/": {
      id: "/study-library/$class/$subject/$module/$chapter/"
      path: "/study-library/$class/$subject/$module/$chapter"
      fullPath: "/study-library/$class/$subject/$module/$chapter"
      preLoaderRoute: typeof StudyLibraryClassSubjectModuleChapterIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/assessment": typeof AssessmentIndexRoute
  "/dashboard": typeof DashboardIndexRoute
  "/login": typeof LoginIndexRoute
  "/students": typeof StudentsIndexRoute
  "/study-library": typeof StudyLibraryIndexRoute
  "/assessment/exam": typeof AssessmentExamIndexRoute
  "/assessment/question-papers": typeof AssessmentQuestionPapersIndexRoute
  "/assessment/tests": typeof AssessmentTestsIndexRoute
  "/login/forgot-password": typeof LoginForgotPasswordIndexRoute
  "/students/students-list": typeof StudentsStudentsListIndexRoute
  "/study-library/$class": typeof StudyLibraryClassIndexRoute
  "/assessment/tests/create-assessment": typeof AssessmentTestsCreateAssessmentIndexRoute
  "/study-library/$class/$subject": typeof StudyLibraryClassSubjectIndexRoute
  "/assessment/create-assessment/$assessmentId/$examtype": typeof AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute
  "/study-library/$class/$subject/$module": typeof StudyLibraryClassSubjectModuleIndexRoute
  "/assessment/exam/assessment-details/$assessmentId/$examType": typeof AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute
  "/study-library/$class/$subject/$module/$chapter": typeof StudyLibraryClassSubjectModuleChapterIndexRoute
}

export interface FileRoutesByTo {
  "/assessment": typeof AssessmentIndexRoute
  "/dashboard": typeof DashboardIndexRoute
  "/login": typeof LoginIndexRoute
  "/students": typeof StudentsIndexRoute
  "/study-library": typeof StudyLibraryIndexRoute
  "/assessment/exam": typeof AssessmentExamIndexRoute
  "/assessment/question-papers": typeof AssessmentQuestionPapersIndexRoute
  "/assessment/tests": typeof AssessmentTestsIndexRoute
  "/login/forgot-password": typeof LoginForgotPasswordIndexRoute
  "/students/students-list": typeof StudentsStudentsListIndexRoute
  "/study-library/$class": typeof StudyLibraryClassIndexRoute
  "/assessment/tests/create-assessment": typeof AssessmentTestsCreateAssessmentIndexRoute
  "/study-library/$class/$subject": typeof StudyLibraryClassSubjectIndexRoute
  "/assessment/create-assessment/$assessmentId/$examtype": typeof AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute
  "/study-library/$class/$subject/$module": typeof StudyLibraryClassSubjectModuleIndexRoute
  "/assessment/exam/assessment-details/$assessmentId/$examType": typeof AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute
  "/study-library/$class/$subject/$module/$chapter": typeof StudyLibraryClassSubjectModuleChapterIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  "/assessment/": typeof AssessmentIndexRoute
  "/dashboard/": typeof DashboardIndexRoute
  "/login/": typeof LoginIndexRoute
  "/students/": typeof StudentsIndexRoute
  "/study-library/": typeof StudyLibraryIndexRoute
  "/assessment/exam/": typeof AssessmentExamIndexRoute
  "/assessment/question-papers/": typeof AssessmentQuestionPapersIndexRoute
  "/assessment/tests/": typeof AssessmentTestsIndexRoute
  "/login/forgot-password/": typeof LoginForgotPasswordIndexRoute
  "/students/students-list/": typeof StudentsStudentsListIndexRoute
  "/study-library/$class/": typeof StudyLibraryClassIndexRoute
  "/assessment/tests/create-assessment/": typeof AssessmentTestsCreateAssessmentIndexRoute
  "/study-library/$class/$subject/": typeof StudyLibraryClassSubjectIndexRoute
  "/assessment/create-assessment/$assessmentId/$examtype/": typeof AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute
  "/study-library/$class/$subject/$module/": typeof StudyLibraryClassSubjectModuleIndexRoute
  "/assessment/exam/assessment-details/$assessmentId/$examType/": typeof AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute
  "/study-library/$class/$subject/$module/$chapter/": typeof StudyLibraryClassSubjectModuleChapterIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | "/assessment"
    | "/dashboard"
    | "/login"
    | "/students"
    | "/study-library"
    | "/assessment/exam"
    | "/assessment/question-papers"
    | "/assessment/tests"
    | "/login/forgot-password"
    | "/students/students-list"
    | "/study-library/$class"
    | "/assessment/tests/create-assessment"
    | "/study-library/$class/$subject"
    | "/assessment/create-assessment/$assessmentId/$examtype"
    | "/study-library/$class/$subject/$module"
    | "/assessment/exam/assessment-details/$assessmentId/$examType"
    | "/study-library/$class/$subject/$module/$chapter"
  fileRoutesByTo: FileRoutesByTo
  to:
    | "/assessment"
    | "/dashboard"
    | "/login"
    | "/students"
    | "/study-library"
    | "/assessment/exam"
    | "/assessment/question-papers"
    | "/assessment/tests"
    | "/login/forgot-password"
    | "/students/students-list"
    | "/study-library/$class"
    | "/assessment/tests/create-assessment"
    | "/study-library/$class/$subject"
    | "/assessment/create-assessment/$assessmentId/$examtype"
    | "/study-library/$class/$subject/$module"
    | "/assessment/exam/assessment-details/$assessmentId/$examType"
    | "/study-library/$class/$subject/$module/$chapter"
  id:
    | "__root__"
    | "/assessment/"
    | "/dashboard/"
    | "/login/"
    | "/students/"
    | "/study-library/"
    | "/assessment/exam/"
    | "/assessment/question-papers/"
    | "/assessment/tests/"
    | "/login/forgot-password/"
    | "/students/students-list/"
    | "/study-library/$class/"
    | "/assessment/tests/create-assessment/"
    | "/study-library/$class/$subject/"
    | "/assessment/create-assessment/$assessmentId/$examtype/"
    | "/study-library/$class/$subject/$module/"
    | "/assessment/exam/assessment-details/$assessmentId/$examType/"
    | "/study-library/$class/$subject/$module/$chapter/"
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AssessmentIndexRoute: typeof AssessmentIndexRoute
  DashboardIndexRoute: typeof DashboardIndexRoute
  LoginIndexRoute: typeof LoginIndexRoute
  StudentsIndexRoute: typeof StudentsIndexRoute
  StudyLibraryIndexRoute: typeof StudyLibraryIndexRoute
  AssessmentExamIndexRoute: typeof AssessmentExamIndexRoute
  AssessmentQuestionPapersIndexRoute: typeof AssessmentQuestionPapersIndexRoute
  AssessmentTestsIndexRoute: typeof AssessmentTestsIndexRoute
  LoginForgotPasswordIndexRoute: typeof LoginForgotPasswordIndexRoute
  StudentsStudentsListIndexRoute: typeof StudentsStudentsListIndexRoute
  StudyLibraryClassIndexRoute: typeof StudyLibraryClassIndexRoute
  AssessmentTestsCreateAssessmentIndexRoute: typeof AssessmentTestsCreateAssessmentIndexRoute
  StudyLibraryClassSubjectIndexRoute: typeof StudyLibraryClassSubjectIndexRoute
  AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute: typeof AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute
  StudyLibraryClassSubjectModuleIndexRoute: typeof StudyLibraryClassSubjectModuleIndexRoute
  AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute: typeof AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute
  StudyLibraryClassSubjectModuleChapterIndexRoute: typeof StudyLibraryClassSubjectModuleChapterIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  AssessmentIndexRoute: AssessmentIndexRoute,
  DashboardIndexRoute: DashboardIndexRoute,
  LoginIndexRoute: LoginIndexRoute,
  StudentsIndexRoute: StudentsIndexRoute,
  StudyLibraryIndexRoute: StudyLibraryIndexRoute,
  AssessmentExamIndexRoute: AssessmentExamIndexRoute,
  AssessmentQuestionPapersIndexRoute: AssessmentQuestionPapersIndexRoute,
  AssessmentTestsIndexRoute: AssessmentTestsIndexRoute,
  LoginForgotPasswordIndexRoute: LoginForgotPasswordIndexRoute,
  StudentsStudentsListIndexRoute: StudentsStudentsListIndexRoute,
  StudyLibraryClassIndexRoute: StudyLibraryClassIndexRoute,
  AssessmentTestsCreateAssessmentIndexRoute:
    AssessmentTestsCreateAssessmentIndexRoute,
  StudyLibraryClassSubjectIndexRoute: StudyLibraryClassSubjectIndexRoute,
  AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute:
    AssessmentCreateAssessmentAssessmentIdExamtypeIndexRoute,
  StudyLibraryClassSubjectModuleIndexRoute:
    StudyLibraryClassSubjectModuleIndexRoute,
  AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute:
    AssessmentExamAssessmentDetailsAssessmentIdExamTypeIndexRoute,
  StudyLibraryClassSubjectModuleChapterIndexRoute:
    StudyLibraryClassSubjectModuleChapterIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/assessment/",
        "/dashboard/",
        "/login/",
        "/students/",
        "/study-library/",
        "/assessment/exam/",
        "/assessment/question-papers/",
        "/assessment/tests/",
        "/login/forgot-password/",
        "/students/students-list/",
        "/study-library/$class/",
        "/assessment/tests/create-assessment/",
        "/study-library/$class/$subject/",
        "/assessment/create-assessment/$assessmentId/$examtype/",
        "/study-library/$class/$subject/$module/",
        "/assessment/exam/assessment-details/$assessmentId/$examType/",
        "/study-library/$class/$subject/$module/$chapter/"
      ]
    },
    "/assessment/": {
      "filePath": "assessment/index.tsx"
    },
    "/dashboard/": {
      "filePath": "dashboard/index.tsx"
    },
    "/login/": {
      "filePath": "login/index.tsx"
    },
    "/students/": {
      "filePath": "students/index.tsx"
    },
    "/study-library/": {
      "filePath": "study-library/index.tsx"
    },
    "/assessment/exam/": {
      "filePath": "assessment/exam/index.tsx"
    },
    "/assessment/question-papers/": {
      "filePath": "assessment/question-papers/index.tsx"
    },
    "/assessment/tests/": {
      "filePath": "assessment/tests/index.tsx"
    },
    "/login/forgot-password/": {
      "filePath": "login/forgot-password/index.tsx"
    },
    "/students/students-list/": {
      "filePath": "students/students-list/index.tsx"
    },
    "/study-library/$class/": {
      "filePath": "study-library/$class/index.tsx"
    },
    "/assessment/tests/create-assessment/": {
      "filePath": "assessment/tests/create-assessment/index.tsx"
    },
    "/study-library/$class/$subject/": {
      "filePath": "study-library/$class/$subject/index.tsx"
    },
    "/assessment/create-assessment/$assessmentId/$examtype/": {
      "filePath": "assessment/create-assessment/$assessmentId/$examtype/index.tsx"
    },
    "/study-library/$class/$subject/$module/": {
      "filePath": "study-library/$class/$subject/$module/index.tsx"
    },
    "/assessment/exam/assessment-details/$assessmentId/$examType/": {
      "filePath": "assessment/exam/assessment-details/$assessmentId/$examType/index.tsx"
    },
    "/study-library/$class/$subject/$module/$chapter/": {
      "filePath": "study-library/$class/$subject/$module/$chapter/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
