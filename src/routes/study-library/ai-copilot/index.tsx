import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import { useState, useCallback, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useSidebar } from '@/components/ui/sidebar';
import { MyButton } from '@/components/design-system/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useDropzone } from 'react-dropzone';
import { X, FileText, Paperclip, Lightbulb, Target, Puzzle, Settings, Sparkles, Upload, Link, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getCourseSettings } from '@/services/course-settings';

export const Route = createFileRoute('/study-library/ai-copilot/')({
    component: RouteComponent,
});


const examplePrompts = [
    'Create a beginner-level Python Programming course for aspiring developers',
    'Design an end-to-end Machine Learning curriculum using Python and Scikit-Learn',
    'Build a Cloud Computing Fundamentals course covering AWS, Azure, and GCP basics',
    'Develop a Data Engineering course focusing on ETL pipelines and SQL concepts',
];

// AI Illustration Component
const AIIllustration = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center justify-center"
        >
            <div className="relative">
                {/* Abstract brain/AI flow shapes */}
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-indigo-400"
                >
                    {/* Central circle (brain/core) */}
                    <motion.circle
                        cx="60"
                        cy="60"
                        r="25"
                        fill="currentColor"
                        opacity="0.2"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.3, 0.2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    {/* Orbiting nodes */}
                    {[0, 1, 2, 3].map((i) => {
                        const angle = (i * Math.PI * 2) / 4;
                        const radius = 40;
                        const x = 60 + radius * Math.cos(angle);
                        const y = 60 + radius * Math.sin(angle);
                        return (
                            <motion.circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="8"
                                fill="currentColor"
                                opacity="0.4"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.4, 0.6, 0.4],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: 'easeInOut',
                                }}
                            />
                        );
                    })}
                    {/* Connecting lines */}
                    <motion.path
                        d="M 60 35 L 95 60 L 60 85 L 25 60 Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.3"
                        animate={{
                            pathLength: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </svg>
                {/* Sparkles icon overlay */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                >
                    <Sparkles className="h-8 w-8 text-indigo-500" />
                </motion.div>
            </div>
        </motion.div>
    );
};

interface PrerequisiteFile {
    file: File;
    id: string;
}

interface PrerequisiteUrl {
    url: string;
    id: string;
}

function RouteComponent() {
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();
    const { setOpen } = useSidebar();
    const [currentStep, setCurrentStep] = useState(1);
    
    // Collapse sidebar on mount
    useEffect(() => {
        setOpen(false);
    }, [setOpen]);

    // Form state
    const [ageRange, setAgeRange] = useState('');
    const [skillLevel, setSkillLevel] = useState('');
    const [prerequisiteFiles, setPrerequisiteFiles] = useState<PrerequisiteFile[]>([]);
    const [prerequisiteUrls, setPrerequisiteUrls] = useState<PrerequisiteUrl[]>([]);
    const [newPrerequisiteUrl, setNewPrerequisiteUrl] = useState('');
    const [courseGoal, setCourseGoal] = useState('');
    const [learningOutcome, setLearningOutcome] = useState('');
    const [includeDiagrams, setIncludeDiagrams] = useState(false);
    const [includeCodeSnippets, setIncludeCodeSnippets] = useState(false);
    const [includePracticeProblems, setIncludePracticeProblems] = useState(false);
    const [includeYouTubeVideo, setIncludeYouTubeVideo] = useState(false);
    const [includeAIGeneratedVideo, setIncludeAIGeneratedVideo] = useState(false);
    const [programmingLanguage, setProgrammingLanguage] = useState('');
    const [numberOfChapters, setNumberOfChapters] = useState('');
    const [chapterLength, setChapterLength] = useState('');
    const [customChapterLength, setCustomChapterLength] = useState('');
    const [includeQuizzes, setIncludeQuizzes] = useState(false);
    const [includeHomework, setIncludeHomework] = useState(false);
    const [includeSolutions, setIncludeSolutions] = useState(false);
    const [slidesPerChapter, setSlidesPerChapter] = useState('');
    const [numberOfSubjects, setNumberOfSubjects] = useState('');
    const [numberOfModules, setNumberOfModules] = useState('');
    const [courseDepth, setCourseDepth] = useState<number>(3);
    const [referenceFiles, setReferenceFiles] = useState<PrerequisiteFile[]>([]);
    const [referenceUrls, setReferenceUrls] = useState<PrerequisiteUrl[]>([]);
    const [newReferenceUrl, setNewReferenceUrl] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    useEffect(() => {
        setNavHeading('Create with Ai');
    }, [setNavHeading]);

    // Fetch course settings to get default course depth
    useEffect(() => {
        const fetchCourseDepth = async () => {
            try {
                const settings = await getCourseSettings();
                const defaultDepth = settings?.courseStructure?.defaultDepth || 3;
                setCourseDepth(defaultDepth);
            } catch (error) {
                console.error('Error fetching course settings:', error);
                // Default to 3 if there's an error
                setCourseDepth(3);
            }
        };
        fetchCourseDepth();
    }, []);

    const handleExamplePromptClick = (examplePrompt: string) => {
        setCourseGoal(examplePrompt);
    };



    const handleAddPrerequisiteUrl = () => {
        if (newPrerequisiteUrl.trim()) {
            setPrerequisiteUrls((prev) => [
                ...prev,
                { url: newPrerequisiteUrl.trim(), id: `${Date.now()}-${Math.random()}` },
            ]);
            setNewPrerequisiteUrl('');
        }
    };

    const handleRemovePrerequisiteUrl = (id: string) => {
        setPrerequisiteUrls((prev) => prev.filter((url) => url.id !== id));
    };

    const onPrerequisiteDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Check for rejected files and show errors
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rejection) => {
                if (rejection.errors) {
                    rejection.errors.forEach((error: any) => {
                        if (error.code === 'file-too-large') {
                            alert(`File "${rejection.file.name}" exceeds the maximum size of 512 MB`);
                        } else if (error.code === 'file-invalid-type') {
                            alert(`File "${rejection.file.name}" is not a valid type. Only PDF, DOC, DOCX, CSV, and XLSX files are allowed.`);
                        } else {
                            alert(`Error with file "${rejection.file.name}": ${error.message}`);
                        }
                    });
                }
            });
        }

        // Validate file size (512 MB = 512 * 1024 * 1024 bytes)
        const maxFileSize = 512 * 1024 * 1024; // 512 MB
        const validFiles = acceptedFiles.filter((file) => {
            if (file.size > maxFileSize) {
                alert(`File "${file.name}" exceeds the maximum size of 512 MB`);
                return false;
            }
            return true;
        });

        // Check if adding these files would exceed the limit of 5
        const currentFileCount = prerequisiteFiles.length;
        const newFileCount = validFiles.length;
        if (currentFileCount + newFileCount > 5) {
            const remainingSlots = 5 - currentFileCount;
            if (remainingSlots > 0) {
                alert(`You can only upload up to 5 files. ${remainingSlots} slot(s) remaining. Only the first ${remainingSlots} file(s) will be added.`);
                validFiles.splice(remainingSlots);
            } else {
                alert('You have already reached the maximum limit of 5 files. Please remove some files before adding new ones.');
                return;
            }
        }

        const newFiles: PrerequisiteFile[] = validFiles.map((file) => ({
            file,
            id: `${Date.now()}-${Math.random()}`,
        }));
        setPrerequisiteFiles((prev) => [...prev, ...newFiles]);
    }, [prerequisiteFiles]);

    const { getRootProps: getPrerequisiteRootProps, getInputProps: getPrerequisiteInputProps, isDragActive: isPrerequisiteDragActive } = useDropzone({
        onDrop: onPrerequisiteDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        multiple: true,
        maxSize: 512 * 1024 * 1024, // 512 MB
        maxFiles: 5,
    });

    const handleRemovePrerequisiteFile = (id: string) => {
        setPrerequisiteFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleAddReferenceUrl = () => {
        if (newReferenceUrl.trim()) {
            setReferenceUrls((prev) => [
                ...prev,
                { url: newReferenceUrl.trim(), id: `${Date.now()}-${Math.random()}` },
            ]);
            setNewReferenceUrl('');
        }
    };

    const handleRemoveReferenceUrl = (id: string) => {
        setReferenceUrls((prev) => prev.filter((url) => url.id !== id));
    };

    const onReferenceDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        // Check for rejected files and show errors
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach((rejection) => {
                if (rejection.errors) {
                    rejection.errors.forEach((error: any) => {
                        if (error.code === 'file-too-large') {
                            alert(`File "${rejection.file.name}" exceeds the maximum size of 512 MB`);
                        } else if (error.code === 'file-invalid-type') {
                            alert(`File "${rejection.file.name}" is not a valid type. Only PDF, DOC, DOCX, CSV, and XLSX files are allowed.`);
                        } else {
                            alert(`Error with file "${rejection.file.name}": ${error.message}`);
                        }
                    });
                }
            });
        }

        // Validate file size (512 MB = 512 * 1024 * 1024 bytes)
        const maxFileSize = 512 * 1024 * 1024; // 512 MB
        const validFiles = acceptedFiles.filter((file) => {
            if (file.size > maxFileSize) {
                alert(`File "${file.name}" exceeds the maximum size of 512 MB`);
                return false;
            }
            return true;
        });

        // Check if adding these files would exceed the limit of 5
        const currentFileCount = referenceFiles.length;
        const newFileCount = validFiles.length;
        if (currentFileCount + newFileCount > 5) {
            const remainingSlots = 5 - currentFileCount;
            if (remainingSlots > 0) {
                alert(`You can only upload up to 5 files. ${remainingSlots} slot(s) remaining. Only the first ${remainingSlots} file(s) will be added.`);
                validFiles.splice(remainingSlots);
            } else {
                alert('You have already reached the maximum limit of 5 files. Please remove some files before adding new ones.');
                return;
            }
        }

        const newFiles: PrerequisiteFile[] = validFiles.map((file) => ({
            file,
            id: `${Date.now()}-${Math.random()}`,
        }));
        setReferenceFiles((prev) => [...prev, ...newFiles]);
    }, [referenceFiles]);

    const { getRootProps: getReferenceRootProps, getInputProps: getReferenceInputProps, isDragActive: isReferenceDragActive } = useDropzone({
        onDrop: onReferenceDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        multiple: true,
        maxSize: 512 * 1024 * 1024, // 512 MB
        maxFiles: 5,
    });

    const handleRemoveReferenceFile = (id: string) => {
        setReferenceFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleChapterLengthChange = (value: string) => {
        setChapterLength(value);
        if (value !== 'custom') {
            setCustomChapterLength('');
        }
    };

    const handleSubmitCourseConfig = () => {
        // Only course goal is required
        if (!courseGoal.trim()) {
            alert('Please enter a course goal');
            return;
        }

        // Validate programming language if code snippets are enabled
        if (includeCodeSnippets && !programmingLanguage) {
            alert('Please select a programming language when code snippets are enabled');
            return;
        }

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    const handleConfirmGenerate = () => {
        // Get chapter length (use default if not provided)
        const finalChapterLength = chapterLength === 'custom' ? customChapterLength : (chapterLength || '60');

        const courseConfig = {
            prompt: courseGoal, // Using courseGoal as the main prompt
            learnerProfile: {
                ageRange: ageRange || undefined,
                skillLevel: skillLevel || undefined,
                prerequisiteFiles: prerequisiteFiles.map((f) => ({
                    name: f.file.name,
                    type: f.file.type,
                    size: f.file.size,
                })),
                prerequisiteUrls: prerequisiteUrls.map((u) => u.url),
            },
            courseGoal,
            learningOutcome: learningOutcome || undefined,
            courseDepthOptions: {
                includeDiagrams,
                includeCodeSnippets,
                includePracticeProblems,
                includeYouTubeVideo,
                includeAIGeneratedVideo,
                programmingLanguage: includeCodeSnippets ? programmingLanguage : undefined,
            },
            durationFormatStructure: {
                numberOfSessions: numberOfChapters ? parseInt(numberOfChapters) : undefined,
                sessionLength: finalChapterLength,
                includeQuizzes,
                includeHomework,
                includeSolutions,
                topicsPerSession: slidesPerChapter ? parseInt(slidesPerChapter) : undefined,
                numberOfSubjects: numberOfSubjects ? parseInt(numberOfSubjects) : undefined,
                numberOfModules: numberOfModules ? parseInt(numberOfModules) : undefined,
            },
            courseDepth: courseDepth,
            references: {
                files: referenceFiles.map((f) => ({
                    name: f.file.name,
                    type: f.file.type,
                    size: f.file.size,
                })),
                urls: referenceUrls.map((u) => u.url),
            },
        };

        console.log('Generating course with config:', courseConfig);
        // Store courseConfig in sessionStorage to pass to generating page
        sessionStorage.setItem('courseConfig', JSON.stringify(courseConfig));
        // Close dialog and navigate to generating page
        setShowConfirmDialog(false);
        navigate({ 
            to: '/study-library/ai-copilot/course-outline/generating'
        });
    };


    return (
        <LayoutContainer>
            <Helmet>
                <title>Create Course with AI</title>
                <meta
                    name="description"
                    content="Create courses with AI assistance using natural language prompts."
                />
            </Helmet>

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-purple-50 px-4 py-6">
                <div className="mx-auto w-full max-w-[900px]">
                    {/* Illustration Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4 flex justify-center"
                    >
                        <AIIllustration />
                    </motion.div>

                    {/* Hero Title & Subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-5 text-center"
                    >
                        <h1 className="mb-2 text-3xl font-semibold text-neutral-900 md:text-4xl">
                            Bring Your Course Idea to Life with AI
                        </h1>
                        <p className="text-base text-gray-600 md:text-lg">
                            Type your idea, add references, and let AI craft a complete learning
                            experience for you.
                        </p>
                    </motion.div>

                    {/* Example Prompts Section - Above Course Goal */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.15 }}
                            className="mb-4"
                        >
                            <h2 className="mb-3 text-center text-sm font-medium text-neutral-700">
                                Try one of these to get started
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {examplePrompts.map((examplePrompt, index) => (
                                    <motion.button
                                        key={index}
                                        type="button"
                                        onClick={() => handleExamplePromptClick(examplePrompt)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-xs font-medium text-neutral-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md"
                                    >
                                        {examplePrompt}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Multi-Step Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4 rounded-2xl border border-indigo-100/50 bg-white/70 p-6 shadow-lg shadow-indigo-100/60 backdrop-blur-sm"
                    >
                            {/* Step 1: Course Goal, Learning Outcome, Duration, Format, and Structure */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                                            Course Goal and Learning Outcome
                                        </h3>
                                        
                        <div className="space-y-4">
                            <div>
                                                <Label htmlFor="courseGoal" className="mb-2 block">
                                                    Course Goal / Prompt <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="courseGoal"
                                                    value={courseGoal}
                                                    onChange={(e) => setCourseGoal(e.target.value)}
                                                    placeholder="Describe the main purpose of the course..."
                                                    className="min-h-[120px] w-full"
                                                />
                                </div>

                                            <div>
                                                <Label htmlFor="learningOutcome" className="mb-2 block">
                                                    Learning Outcome
                                                </Label>
                                    <Textarea
                                                    id="learningOutcome"
                                                    value={learningOutcome}
                                                    onChange={(e) => setLearningOutcome(e.target.value)}
                                                    placeholder="What should learners achieve by the end of the course? (Optional)"
                                                    className="min-h-[100px] w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Duration, Format, and Structure Section */}
                                    <div>
                                        <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                                            Duration, Format, and Structure
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            {/* First Row: Skill Level, Number of Chapters, Chapter Length */}
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <Label htmlFor="skillLevel" className="mb-2 block">
                                                        Skill Level
                                                    </Label>
                                                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                                                        <SelectTrigger id="skillLevel" className="w-full">
                                                            <SelectValue placeholder="Select skill level (Optional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="beginner">Beginner</SelectItem>
                                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                                            <SelectItem value="advanced">Advanced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="numberOfChapters" className="mb-2 block">
                                                        Number of Chapters
                                                    </Label>
                                                    <Input
                                                        id="numberOfChapters"
                                                        type="text"
                                                        value={numberOfChapters}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Only allow numbers
                                                            if (value === '' || /^\d+$/.test(value)) {
                                                                setNumberOfChapters(value);
                                                            }
                                                        }}
                                                        placeholder="e.g., 8"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="chapterLength" className="mb-2 block">
                                                        Chapter Length
                                                    </Label>
                                                    <div className="space-y-2">
                                                        <Select value={chapterLength} onValueChange={handleChapterLengthChange}>
                                                            <SelectTrigger id="chapterLength" className="w-full">
                                                                <SelectValue placeholder="Select chapter length" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="45">45 minutes</SelectItem>
                                                                <SelectItem value="60">60 minutes</SelectItem>
                                                                <SelectItem value="90">90 minutes</SelectItem>
                                                                <SelectItem value="custom">Custom</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {chapterLength === 'custom' && (
                                                            <Input
                                                                type="text"
                                                                value={customChapterLength}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    // Only allow numbers
                                                                    if (value === '' || /^\d+$/.test(value)) {
                                                                        setCustomChapterLength(value);
                                                                    }
                                                                }}
                                                                placeholder="Enter custom length in minutes"
                                                                className="w-full"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="mb-2 block">What to include</Label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeDiagrams"
                                                            checked={includeDiagrams}
                                                            onCheckedChange={(checked) => setIncludeDiagrams(checked === true)}
                                                        />
                                                        <Label htmlFor="includeDiagrams" className="cursor-pointer">
                                                            Include diagrams
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeCodeSnippets"
                                                            checked={includeCodeSnippets}
                                                            onCheckedChange={(checked) => setIncludeCodeSnippets(checked === true)}
                                                        />
                                                        <Label htmlFor="includeCodeSnippets" className="cursor-pointer">
                                                            Include code snippets
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includePracticeProblems"
                                                            checked={includePracticeProblems}
                                                            onCheckedChange={(checked) => setIncludePracticeProblems(checked === true)}
                                                        />
                                                        <Label htmlFor="includePracticeProblems" className="cursor-pointer">
                                                            Include practice problems
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeQuizzes"
                                                            checked={includeQuizzes}
                                                            onCheckedChange={(checked) => setIncludeQuizzes(checked === true)}
                                                        />
                                                        <Label htmlFor="includeQuizzes" className="cursor-pointer">
                                                            Include quizzes
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeHomework"
                                                            checked={includeHomework}
                                                            onCheckedChange={(checked) => setIncludeHomework(checked === true)}
                                                        />
                                                        <Label htmlFor="includeHomework" className="cursor-pointer">
                                                            Include assignments
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeSolutions"
                                                            checked={includeSolutions}
                                                            onCheckedChange={(checked) => setIncludeSolutions(checked === true)}
                                                        />
                                                        <Label htmlFor="includeSolutions" className="cursor-pointer">
                                                            Include solutions
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeYouTubeVideo"
                                                            checked={includeYouTubeVideo}
                                                            onCheckedChange={(checked) => setIncludeYouTubeVideo(checked === true)}
                                                        />
                                                        <Label htmlFor="includeYouTubeVideo" className="cursor-pointer">
                                                            Include YouTube video
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id="includeAIGeneratedVideo"
                                                            checked={includeAIGeneratedVideo}
                                                            onCheckedChange={(checked) => setIncludeAIGeneratedVideo(checked === true)}
                                                        />
                                                        <Label htmlFor="includeAIGeneratedVideo" className="cursor-pointer">
                                                            Include AI generated video
                                                        </Label>
                                                    </div>
                                                </div>
                                                {includeCodeSnippets && (
                                                    <div className="mt-4">
                                                        <Label htmlFor="programmingLanguage" className="mb-2 block">
                                                            Programming Language
                                                        </Label>
                                                        <Select value={programmingLanguage} onValueChange={setProgrammingLanguage}>
                                                            <SelectTrigger id="programmingLanguage" className="w-full">
                                                                <SelectValue placeholder="Select programming language" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="python">Python</SelectItem>
                                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                                <SelectItem value="java">Java</SelectItem>
                                                                <SelectItem value="cpp">C++</SelectItem>
                                                                <SelectItem value="csharp">C#</SelectItem>
                                                                <SelectItem value="go">Go</SelectItem>
                                                                <SelectItem value="rust">Rust</SelectItem>
                                                                <SelectItem value="typescript">TypeScript</SelectItem>
                                                                <SelectItem value="php">PHP</SelectItem>
                                                                <SelectItem value="ruby">Ruby</SelectItem>
                                                                <SelectItem value="swift">Swift</SelectItem>
                                                                <SelectItem value="kotlin">Kotlin</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Number of Subjects - Show if depth > 4 */}
                                            {courseDepth > 4 && (
                                                <div>
                                                    <Label htmlFor="numberOfSubjects" className="mb-2 block">
                                                        Number of Subjects
                                                    </Label>
                                                    <Input
                                                        id="numberOfSubjects"
                                                        type="text"
                                                        value={numberOfSubjects}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Only allow numbers
                                                            if (value === '' || /^\d+$/.test(value)) {
                                                                setNumberOfSubjects(value);
                                                            }
                                                        }}
                                                        placeholder="e.g., 2, 3, 4, etc."
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}

                                            {/* Number of Modules - Show if depth > 3 */}
                                            {courseDepth > 3 && (
                                                <div>
                                                    <Label htmlFor="numberOfModules" className="mb-2 block">
                                                        Number of Modules
                                                    </Label>
                                                    <Input
                                                        id="numberOfModules"
                                                        type="text"
                                                        value={numberOfModules}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            // Only allow numbers
                                                            if (value === '' || /^\d+$/.test(value)) {
                                                                setNumberOfModules(value);
                                                            }
                                                        }}
                                                        placeholder="e.g., 2, 3, 4, etc."
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}

                                            {/* Slides per Chapter */}
                                            <div>
                                                <Label htmlFor="slidesPerChapter" className="mb-2 block">
                                                    Slides per Chapter
                                                </Label>
                                                <Input
                                                    id="slidesPerChapter"
                                                    type="text"
                                                    value={slidesPerChapter}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        // Only allow numbers
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            setSlidesPerChapter(value);
                                                        }
                                                    }}
                                                    placeholder="e.g., 2, 3, 4, etc."
                                                    className="w-full"
                                                />
                                            </div>

                                            {/* References (Optional) - Full Width Below */}
                                            <div>
                                                <Label className="mb-2 block">References (Optional)</Label>
                                                <p className="mb-3 text-xs text-neutral-500">You can add multiple URLs</p>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={newReferenceUrl}
                                                            onChange={(e) => setNewReferenceUrl(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleAddReferenceUrl();
                                                                }
                                                            }}
                                                            placeholder="Enter URL (e.g., https://example.com/course)"
                                                            className="flex-1"
                                                        />
                                                        <MyButton
                                                            buttonType="secondary"
                                                            onClick={handleAddReferenceUrl}
                                                            disabled={!newReferenceUrl.trim()}
                                                        >
                                                            <Link className="h-4 w-4 mr-1" />
                                                            Add URL
                                                        </MyButton>
                                                    </div>

                                                    {referenceUrls.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {referenceUrls.map((url) => (
                                                                <div
                                                                    key={url.id}
                                                                    className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700"
                                                                >
                                                                    <Link className="h-3.5 w-3.5" />
                                                                    <span className="max-w-[200px] truncate">{url.url}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveReferenceUrl(url.id)}
                                                                        className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-100"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div
                                                        {...getReferenceRootProps()}
                                                        className={cn(
                                                            'flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all duration-200',
                                                            isReferenceDragActive
                                                                ? 'border-indigo-400 bg-indigo-50'
                                                                : 'border-neutral-300 bg-neutral-50 hover:border-indigo-300 hover:bg-indigo-50'
                                                        )}
                                                    >
                                                        <input {...getReferenceInputProps()} className="hidden" />
                                                        <Upload className={cn('h-5 w-5', isReferenceDragActive ? 'text-indigo-600' : 'text-neutral-500')} />
                                                        <span className="text-xs font-medium text-neutral-600">
                                                            Attach PDF, DOC, DOCX, CSV, or XLSX files
                                                        </span>
                                                        <span className="text-xs text-neutral-500">
                                                            Maximum 512 MB per file • Upload up to 5 files
                                                        </span>
                                                    </div>

                                                    {referenceFiles.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {referenceFiles.map((file) => (
                                                                <div
                                                                    key={file.id}
                                                                    className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700"
                                                                >
                                                                    <FileText className="h-3.5 w-3.5" />
                                                                    <span className="max-w-[150px] truncate">{file.file.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveReferenceFile(file.id)}
                                                                        className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-100"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <MyButton
                                            buttonType="primary"
                                            onClick={handleSubmitCourseConfig}
                                            disabled={!courseGoal.trim()}
                                        >
                                            Generate Outline
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                    </motion.div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="w-[90vw] max-w-[900px] max-h-[80vh] flex flex-col p-0">
                    <DialogHeader className="sticky top-0 bg-white z-10 border-b border-neutral-200 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <DialogTitle className="text-xl font-semibold text-neutral-900">
                                Review Course Goal
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-neutral-600 pt-2">
                            <p className="mb-2">
                                Please review your course configuration below. Once you proceed, you won't be able to return and edit this information.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    
                    {/* Summary Section - Scrollable */}
                    <div className="flex-1 overflow-y-auto px-6">
                        <div className="space-y-4 py-4">
                        {/* Course Goal */}
                        <div>
                            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Course Goal</h4>
                            <p className="text-sm text-neutral-600 bg-neutral-50 rounded-md p-3 border border-neutral-200">
                                {courseGoal || 'Not provided'}
                            </p>
                        </div>

                        {/* Learning Outcome */}
                        {learningOutcome && (
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 mb-2">Learning Outcome</h4>
                                <p className="text-sm text-neutral-600 bg-neutral-50 rounded-md p-3 border border-neutral-200">
                                    {learningOutcome}
                                </p>
                            </div>
                        )}

                        {/* Course Details */}
                        <div className="grid grid-cols-2 gap-4">
                            {skillLevel && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Skill Level</h4>
                                    <p className="text-sm text-neutral-600 capitalize">{skillLevel}</p>
                                </div>
                            )}
                            {numberOfSubjects && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Number of Subjects</h4>
                                    <p className="text-sm text-neutral-600">{numberOfSubjects}</p>
                                </div>
                            )}
                            {numberOfModules && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Number of Modules</h4>
                                    <p className="text-sm text-neutral-600">{numberOfModules}</p>
                                </div>
                            )}
                            {numberOfChapters && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Number of Chapters</h4>
                                    <p className="text-sm text-neutral-600">{numberOfChapters}</p>
                                </div>
                            )}
                            {(chapterLength || customChapterLength) && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Chapter Length</h4>
                                    <p className="text-sm text-neutral-600">
                                        {chapterLength === 'custom' ? `${customChapterLength} minutes` : chapterLength ? `${chapterLength} minutes` : ''}
                                    </p>
                                </div>
                            )}
                            {slidesPerChapter && (
                                <div>
                                    <h4 className="text-sm font-semibold text-neutral-900 mb-1">Slides per Chapter</h4>
                                    <p className="text-sm text-neutral-600">{slidesPerChapter}</p>
                                </div>
                            )}
                        </div>

                        {/* What to Include */}
                        {(includeDiagrams || includeCodeSnippets || includePracticeProblems || includeQuizzes || 
                          includeHomework || includeSolutions || includeYouTubeVideo || includeAIGeneratedVideo) && (
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 mb-2">What to Include</h4>
                                <div className="flex flex-wrap gap-2">
                                    {includeDiagrams && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">Diagrams</span>
                                    )}
                                    {includeCodeSnippets && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">
                                            Code Snippets{programmingLanguage ? ` (${programmingLanguage})` : ''}
                                        </span>
                                    )}
                                    {includePracticeProblems && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">Practice Problems</span>
                                    )}
                                    {includeQuizzes && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">Quizzes</span>
                                    )}
                                    {includeHomework && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">Assignments</span>
                                    )}
                                    {includeSolutions && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">Solutions</span>
                                    )}
                                    {includeYouTubeVideo && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">YouTube Video</span>
                                    )}
                                    {includeAIGeneratedVideo && (
                                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">AI Generated Video</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* References */}
                        {(referenceUrls.length > 0 || referenceFiles.length > 0) && (
                            <div>
                                <h4 className="text-sm font-semibold text-neutral-900 mb-2">References</h4>
                                <div className="space-y-2">
                                    {referenceUrls.length > 0 && (
                                        <p className="text-sm text-neutral-600">
                                            <span className="font-medium">{referenceUrls.length}</span> URL{referenceUrls.length !== 1 ? 's' : ''} added
                                        </p>
                                    )}
                                    {referenceFiles.length > 0 && (
                                        <p className="text-sm text-neutral-600">
                                            <span className="font-medium">{referenceFiles.length}</span> file{referenceFiles.length !== 1 ? 's' : ''} uploaded
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>

                    <DialogFooter className="sticky bottom-0 bg-white z-10 border-t border-neutral-200 px-6 py-4">
                        <MyButton
                            buttonType="secondary"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Go back and Edit
                        </MyButton>
                        <MyButton
                            buttonType="primary"
                            onClick={handleConfirmGenerate}
                        >
                            Continue
                        </MyButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LayoutContainer>
    );
}
