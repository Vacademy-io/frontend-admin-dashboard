export interface ToolInstructionsType {
    stepHeading: string;
    steps: string[];
    stepSubHeading?: string;
    stepFooter?: string;
}

export interface ToolDataType {
    key: string;
    heading: string;
    instructionsHeading: string;
    instructionsSubHeading?: string;
    instructions: ToolInstructionsType[];
}

export interface AIToolPageDataType {
    [key: string]: ToolDataType;
}

export const AIToolPageData: AIToolPageDataType = {
    assessment: {
        key: "assessment",
        heading: "Vsmart Upload",
        instructionsHeading:
            "Follow these simple steps to generate a question paper from your PDF, Word, or PPT files:",
        instructions: [
            {
                stepHeading: "Upload Your File",
                steps: [
                    "Click on Upload File",
                    "Supported formats: .pdf, .doc, .docx, .ppt, .pptx",
                ],
            },
            {
                stepHeading: "Choose How You Want to Generate Questions",
                steps: [
                    "Option 1: Generate from Entire File The tool will scan the full document and create questions from all the content",
                    "Option 2: Copy Specific Text. Manually paste a section of the content that you'd like to generate questions from.",
                ],
            },
            {
                stepHeading: "Customize the Output",
                stepSubHeading:
                    "After selecting the content source, specify the following details:",
                steps: [
                    "Number of Questions (e.g., 10, 20...)",
                    "Difficulty Level (Easy, Medium, Hard)",
                    "Topic/Chapter Name (Optional, for better context)",
                    "Question Type (MCQs, Short Answer, Descriptive, Mixed)",
                    "Preferred Language (English, Hindi, or any supported language)",
                ],
            },
            {
                stepHeading: "Click Generate",
                steps: [
                    "Sit back while the AI processes your input. This might take a few seconds",
                    "You can continue working or navigate away — the system will keep working in the background.",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once generated, click on Export to download your question paper in PDF or DOC format.",
                    "You are now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    audio: {
        key: "audio",
        heading: "Vsmart Audio",
        instructionsHeading: "How to Use Vsmart Audio",
        instructions: [
            {
                stepHeading: "Upload Your Audio File",
                steps: ["Click on Upload File", "Supported formats: WAV, FLAC, MP3, AAC, M4A"],
            },
            {
                stepHeading: "Set Your Preferences",
                stepSubHeading: "Fill in the details to shape your question paper:",
                steps: [
                    "Number of Questions (e.g., 5, 10, 20...)",
                    "Level (e.g., Beginner, Intermediate, Advanced)",
                    "Topic or Focus Area (Optional)",
                    "Question Type (MCQs, Short Answer, Descriptive, Mixed)",
                    "Question Language (Choose from supported languages)",
                ],
            },
            {
                stepHeading: "Click Generate",
                steps: [
                    "Once your file is uploaded and details are in, hit the Generate button. The AI will process the audio and start crafting questions.",
                    "This may take some time, depending on the length of your audio. Feel free to explore or come back later.",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once generated, click on Export to download your question paper in PDF or DOC format.",
                    "You're now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    text: {
        key: "text",
        heading: "Vsmart Topics",
        instructionsHeading: "How to Use Vsmart Topics",
        instructions: [
            {
                stepHeading: "Click on Generate Questions",
                steps: ["Start by clicking the Generate Questions button to open the prompt panel"],
            },
            {
                stepHeading: "Enter Your Prompt",
                steps: [
                    "Describe what you want questions for – be as specific or broad as you like.",
                    'Example: "Generate a set of questions covering all the principles of photosynthesis, including the process, factors affecting it, and its importance in the ecosystem. Focus on conceptual understanding and application"',
                ],
            },
            {
                stepHeading: "Add Generation Preferences",
                stepSubHeading:
                    "Fine-tune your question paper by filling in the following details:",
                steps: [
                    "Number of Questions (e.g., 5, 10, 20...)",
                    "Level (e.g., Easy, Medium, Hard, Intermediate...)",
                    "Topic or Chapter Name (Optional)",
                    "Question Type (MCQs, Short Answer, Descriptive, Mixed)",
                    "Question Language (Choose from supported languages)",
                ],
            },
            {
                stepHeading: "Click Generate",
                steps: [
                    "Once you're ready, click the Generate button. The AI will start working on your custom paper.",
                    "You can stay on the page or continue exploring — generation happens in the background.",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once generated, click on Export to download your question paper in PDF or DOC format.",
                    "You're now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    chat: {
        key: "chat",
        heading: "Vsmart Chat",
        instructionsHeading: "How to Use Vsmart Upload",
        instructionsSubHeading:
            "This tool allows you to upload educational files — like PDF, DOC, or PPT — and automatically generates questions from the content. Then, with a built-in chat interface, you can customize those questions using simple prompts.",
        instructions: [
            {
                stepHeading: "Upload Your File",
                steps: ["Click on upload file", "Supported formats: pdf, doc, docx, ppt, pptx"],
            },
            {
                stepHeading: "Let AI Generate Questions",
                steps: [
                    "Once uploaded, the AI scans the content and automatically generates a draft question paper based on the material",
                ],
            },
            {
                stepHeading: "Modify Using Chat",
                steps: [
                    "When the questions are ready, you can chat with the AI to refine them:",
                    "Ask things like:",
                    '"Add more questions/multiple choice"',
                    '"Add more higher-order thinking questions"',
                    '"Simplify question 3"',
                    '"Include more questions from the second half of the document"',
                ],
                stepFooter: "It's as easy as texting — no technical skills needed.",
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "You can go to the My AI Tasks tab to check all the question papers generated.",
                    "There, you can review, regenerate, or export them at any time.",
                ],
            },
        ],
    },
    question: {
        key: "question",
        heading: "Vsmart Extract",
        instructionsHeading: "How to Use Vsmart Extract",
        instructionsSubHeading:
            "This tool reads your uploaded content and automatically pulls out relevant questions — perfect for reusing material from notes, textbooks, or presentations.",
        instructions: [
            {
                stepHeading: "Upload Your File",
                steps: ["Click on upload file", "Supported formats: pdf, doc, docx, ppt, pptx"],
            },
            {
                stepHeading: "Let the AI Do the Work",
                steps: [
                    "Once uploaded, the tool begins processing your file to identify and extract potential questions.",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Refine with Prompts (Optional)",
                steps: [
                    "Use the Regenerate option to generate additional questions.",
                    "Modify existing questions using a custom prompt to change type, complexity, or format.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once satisfied, click Export to download your question paper in PDF or DOC format.",
                    "You're now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    image: {
        key: "image",
        heading: "Vsmart Image",
        instructionsHeading: "How to Use Vsmart Image",
        instructionsSubHeading:
            "This tool lets you upload an image of content — handwritten notes, printed pages, textbook snapshots — and automatically extracts relevant questions from it.",
        instructions: [
            {
                stepHeading: "Upload Your Image",
                steps: ["Click on Upload", "Supported formats: jpg, jpeg, png"],
            },
            {
                stepHeading: "Let the AI Process It",
                steps: [
                    "Once uploaded, the tool scans the image, reads the text, and begins generating relevant questions from the extracted content",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers",
                    "Once ready, you'll see the status change to Completed",
                ],
            },
            {
                stepHeading: "Refine with Prompts (Optional)",
                steps: [
                    "Use the Regenerate option to generate additional questions",
                    "Modify existing questions using a custom prompt to change type, complexity, or format",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once satisfied, click Export to download your question paper in PDF or DOC format",
                    "You're now ready to print, share, or upload it into your assessment system",
                ],
            },
        ],
    },
    sortSplitPdf: {
        key: "sortSplitPdf",
        heading: "Vsmart Organizer",
        instructionsHeading: "How to Use Vsmart Organizer",
        instructionsSubHeading:
            "Upload a PDF, PPT, or DOC file to automatically generate and group questions by topic — perfect for chapter-wise tests or syllabus-aligned assessments.",
        instructions: [
            {
                stepHeading: "Upload Your File",
                steps: ["Click on Upload File", "Supported formats: pdf, doc, docx, ppt, pptx"],
            },
            {
                stepHeading: "Let the AI Organize It",
                steps: [
                    "The tool analyzes the content, creates relevant questions, and automatically arranges them under specific topic headings",
                ],
            },
            {
                stepHeading: "Click Regenerate (Optional)",
                steps: [
                    "Want a different set of questions or structure? Use the Regenerate button and add a custom prompt to tweak order, complexity, or question style.",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once generated, click on Export to download your question paper in PDF or DOC format.",
                    "You're now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    sortTopicsPdf: {
        key: "sortTopicsPdf",
        heading: "Vsmart Sorter",
        instructionsHeading: "How to Use Vsmart Sorter",
        instructionsSubHeading:
            "Organize your question paper with precision — sort by topics and define the exact order using simple prompts.",
        instructions: [
            {
                stepHeading: "Upload Your File",
                steps: ["Click on Upload File", "Supported formats: pdf, doc, docx, ppt, pptx"],
            },
            {
                stepHeading: "AI Generates & Sorts Questions",
                steps: [
                    "Once uploaded, the tool reads the content, generates questions, and groups them under relevant topics or chapters",
                ],
            },
            {
                stepHeading: "Rearrange Using Prompts",
                steps: [
                    "Want specific questions to appear first? Just type your instruction.",
                    "Example: \"I want the 5th and 6th questions from 'Plant Nutrition' to be the first two questions in the paper\"",
                ],
            },
            {
                stepHeading: "View Status in My AI Task",
                steps: [
                    "Go to the My AI Task tab to track the progress of your generated papers.",
                    "Once ready, you'll see the status change to Completed.",
                ],
            },
            {
                stepHeading: "Export & Use",
                steps: [
                    "Once generated, click on Export to download your question paper in PDF or DOC format.",
                    "You're now ready to print, share, or upload it into your assessment system.",
                ],
            },
        ],
    },
    planLecture: {
        key: "planLecture",
        heading: "Vsmart Lecturer",
        instructionsHeading: "How to Use Vsmart Sorter",
        instructionsSubHeading:
            "This tool helps you generate a complete lecture plan tailored to your teaching style, topics, language, and timeframe — including optional in-between questions and end-of-lecture assignments.",
        instructions: [
            {
                stepHeading: "Click Plan Lecture",
                steps: [
                    "Lecture Title and Topics",
                    "Academic Level (e.g., 8th Standard)",
                    "Preferred Teaching Method (e.g., Storytelling, More Examples",
                    "Language (English or Hindi)",
                    "Total Duration of the Lecture",
                    "Include Questions in Between? (Yes/No)",
                    "Add Assignment or Homework at the End? (Yes/No)",
                ],
            },
            {
                stepHeading: "Click Generate",
                steps: [
                    "Once your preferences are set, hit the Generate button. The AI will take a few moments to craft a smart, structured, and interactive lecture plan based on your inputs.",
                ],
            },
            {
                stepHeading: "Export Your Plan",
                steps: [
                    "Time-wise structure",
                    "Topic-wise breakdown",
                    "Built-in engagement points (if selected)",
                    "Assignment section (if selected)",
                    "Teaching method-based content generation",
                ],
            },
        ],
    },
};
