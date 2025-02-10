import { Step } from "@/hooks/use-intro";

const dashboardSteps: Step[] = [
    {
        element: "#dashboard",
        title: "Welcome to Your Dashboard!",
        intro: "Your dashboard provides quick access to institute info and key actions.",
    },
    {
        element: "#student-mangement",
        title: "Student Management",
        intro: "Enroll, view details, update info, and assign batches. Manage all students here.",
    },
    {
        element: "#study-library",
        title: "Study Library",
        intro: "Create and manage courses by defining levels and subjects, and organizing the course structure for better progression.",
    },
    {
        element: "#assessment-centre",
        title: "Assessment Centre",
        intro: "Build assessments, assign them to batches, and monitor student performance—all in one place.",
    },
    {
        element: "#quick-enrollment",
        title: "Quick Enrollment",
        intro: "New students? Enroll them easily from here.",
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
    },
    {
        element: "#basic-info",
        title: "Complete Basic Info",
        intro: "Provide the basic details of the assessment and move forward.",
    },
    {
        element: "#add-question",
        title: "Add Questions",
        intro: "Add questions for each section and configure the marking scheme accordingly.",
    },
    {
        element: "#add-participants",
        title: "Add Participants",
        intro: "Assign participants by selecting batches or adding them individually to the assessment.",
    },
    {
        element: "#access-control",
        title: "Access Control",
        intro: "Control who can access the assessment by configuring the access settings.",
    },
];

export { dashboardSteps, createAssesmentSteps };
