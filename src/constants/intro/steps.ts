import { Step } from "@/hooks/use-intro";

const dashboardSteps: Step[] = [
    {
        element: "#dashboard",
        title: "Welcome to Your Dashboard!",
        intro: "Your dashboard provides quick access to institute info and key actions.",
        position: "right",
    },
    {
        element: "#student-mangement",
        title: "Student Management",
        intro: "Enroll, view details, update info, and assign batches. Manage all students here.",
        position: "right",
    },
    {
        element: "#study-library",
        title: "Study Library",
        intro: "Create and manage courses by defining levels and subjects, and organizing the course structure for better progression.",
        position: "right",
    },
    {
        element: "#assessment-centre",
        title: "Assessment Centre",
        intro: "Build assessments, assign them to batches, and monitor student performance—all in one place.",
        position: "right",
    },
    {
        element: "#quick-enrollment",
        title: "Quick Enrollment",
        intro: "New students? Enroll them easily from here.",
        position: "top",
    },
    {
        element: "#first-course",
        title: "Create Your First Course",
        intro: "Begin managing your courses by setting up your first one. It is quick and simple",
    },
    {
        element: "#first-assessment",
        title: "Create your first assessment",
        intro: "Quickly create your first assessment to evaluate and track student progress.",
    },
];

const createAssesmentSteps: Step[] = [
    {
        element: "#create-assessment",
        title: "Create Assessment",
        intro: "Set up your first assessment with ease.",
        position: "right",
    },
    {
        element: "#basic-info",
        title: "Complete Basic Info",
        intro: "Provide the basic details of the assessment and move forward.",
        position: "right",
    },
    {
        element: "#add-question",
        title: "Add Questions",
        intro: "Add questions for each section and configure the marking scheme accordingly.",
        position: "right",
    },
    {
        element: "#add-participants",
        title: "Add Participants",
        intro: "Assign participants by selecting batches or adding them individually to the assessment.",
        position: "right",
    },
    {
        element: "#access-control",
        title: "Access Control",
        intro: "Control who can access the assessment by configuring the access settings.",
        position: "right",
    },
];

const createCourseStep: Step[] = [
    {
        element: "#create-new-course",
        title: "Create a New Course",
        intro: "Start by setting up a new course in the Study Library. Define its name, description, and other details to structure your learning material efficiently.",
    },
];

const assignYearStep: Step[] = [
    {
        element: "#assign-year",
        title: "Assign Year/Class/Level",
        intro: "Categorize the course by selecting the appropriate year, class, or level to ensure proper organization and accessibility for students.",
    },
];

const addSubjectStep: Step[] = [
    {
        element: "#add-subject",
        title: "Add Subject",
        intro: "Select and assign subjects under the chosen Year/Class/Level to structure the study library efficiently.",
    },
];

const addModulesStep: Step[] = [
    {
        element: "#add-modules",
        title: "Add Modules",
        intro: "Create and organize modules within the selected subject to streamline study materials and enhance course structure.",
    },
];

const addChaptersStep: Step[] = [
    {
        element: "#add-chapters",
        title: "Add Chapters",
        intro: "Break down modules into chapters to structure the study material effectively and provide a clear learning path for students.",
    },
];

const addSlidesStep: Step[] = [
    {
        element: "#add-slides",
        title: "Add Slides",
        intro: "Enhance chapters by adding slides in various formats like videos, PDFs, or documents to create a comprehensive learning experience.",
        position: "right",
    },
];

const publishSlideStep: Step[] = [
    {
        element: "#publish-slide",
        title: "Publish Slide",
        intro: "Make the slide accessible to assigned batches by clicking `Publish` Once published, students can view the content.",
        position: "right",
    },
];

const studyLibrarySteps = {
    createCourseStep,
    assignYearStep,
    addSubjectStep,
    addModulesStep,
    addChaptersStep,
    addSlidesStep,
    publishSlideStep,
};

const studentManagementSteps: Step[] = [
    {
        element: "#enroll-students",
        title: "Enroll Students",
        intro: "Enroll students manually or upload a CSV to bulk enroll. Select the course and session to get them started.",
        position: "left",
    },
    {
        element: "#organize",
        title: "Organize with Filters",
        intro: "Apply filters to quickly find and manage student data improving your workflow.",
        position: "right",
    },
    {
        element: "#export-data",
        title: "Export Data",
        intro: "Quickly export student details in a structured CSV file, making it easy to store or share records.",
        position: "bottom",
    },
];

export { dashboardSteps, createAssesmentSteps, studyLibrarySteps, studentManagementSteps };
