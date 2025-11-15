import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import { useState, useCallback, useEffect } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { MyButton } from '@/components/design-system/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useDropzone } from 'react-dropzone';
import { X, FileText, Paperclip, Lightbulb, Target, Puzzle, Settings, Sparkles, Upload, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export const Route = createFileRoute('/study-library/ai-copilot/')({
    component: RouteComponent,
});


const examplePrompts = [
    'Create a 4-week Web Design course for beginners',
    'Design an Advanced Machine Learning curriculum',
    'Build a Photography Basics course for creative teens',
    'Develop a Data Analysis course using Excel and Power BI',
];

const tips = [
    { icon: FileText, text: 'Be specific about your subject & audience' },
    { icon: Target, text: 'Include learning objectives or key topics' },
    { icon: Puzzle, text: 'Mention course level (beginner, intermediate, advanced)' },
    { icon: Settings, text: 'Add any prerequisites or background knowledge' },
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
    const [currentStep, setCurrentStep] = useState(1);

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
    const [numberOfSessions, setNumberOfSessions] = useState('');
    const [sessionLength, setSessionLength] = useState('');
    const [customSessionLength, setCustomSessionLength] = useState('');
    const [includeQuizzes, setIncludeQuizzes] = useState(false);
    const [includeHomework, setIncludeHomework] = useState(false);
    const [includeSolutions, setIncludeSolutions] = useState(false);
    const [topicsPerSession, setTopicsPerSession] = useState('');
    const [topics, setTopics] = useState<string[]>([]);
    const [newTopic, setNewTopic] = useState('');
    const [referenceFiles, setReferenceFiles] = useState<PrerequisiteFile[]>([]);
    const [referenceUrls, setReferenceUrls] = useState<PrerequisiteUrl[]>([]);
    const [newReferenceUrl, setNewReferenceUrl] = useState('');

    useEffect(() => {
        setNavHeading('Create with Ai');
    }, [setNavHeading]);

    const handleExamplePromptClick = (examplePrompt: string) => {
        setCourseGoal(examplePrompt);
    };


    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate Step 1: Course Goal is required
            if (!courseGoal.trim()) {
                alert('Please enter a course goal');
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            // Step 2 is optional, can skip
            setCurrentStep(3);
        }
    };

    const handleSkipStep2 = () => {
        setCurrentStep(3);
    };

    const handleBackStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
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

    const onPrerequisiteDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: PrerequisiteFile[] = acceptedFiles.map((file) => ({
            file,
            id: `${Date.now()}-${Math.random()}`,
        }));
        setPrerequisiteFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps: getPrerequisiteRootProps, getInputProps: getPrerequisiteInputProps, isDragActive: isPrerequisiteDragActive } = useDropzone({
        onDrop: onPrerequisiteDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: true,
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

    const onReferenceDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: PrerequisiteFile[] = acceptedFiles.map((file) => ({
            file,
            id: `${Date.now()}-${Math.random()}`,
        }));
        setReferenceFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps: getReferenceRootProps, getInputProps: getReferenceInputProps, isDragActive: isReferenceDragActive } = useDropzone({
        onDrop: onReferenceDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: true,
    });

    const handleRemoveReferenceFile = (id: string) => {
        setReferenceFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const handleSessionLengthChange = (value: string) => {
        setSessionLength(value);
        if (value !== 'custom') {
            setCustomSessionLength('');
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

        // Get session length (use default if not provided)
        const finalSessionLength = sessionLength === 'custom' ? customSessionLength : (sessionLength || '60');

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
            courseDepth: {
                includeDiagrams,
                includeCodeSnippets,
                includePracticeProblems,
                includeYouTubeVideo,
                includeAIGeneratedVideo,
                programmingLanguage: includeCodeSnippets ? programmingLanguage : undefined,
            },
            durationFormatStructure: {
                numberOfSessions: numberOfSessions ? parseInt(numberOfSessions) : undefined,
                sessionLength: finalSessionLength,
                includeQuizzes,
                includeHomework,
                includeSolutions,
                topicsPerSession: topicsPerSession ? parseInt(topicsPerSession) : undefined,
                topics: topics.length > 0 ? topics : undefined,
            },
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
        // Navigate to course outline page
        navigate({ to: '/study-library/ai-copilot/course-outline' });
    };


    return (
        <LayoutContainer public={true}>
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

                    {/* Tips Section - Moved Above Input */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="mb-4"
                    >
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-neutral-800">Course Creation Tips</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-indigo-50 p-3.5">
                            {tips.map((tip, index) => {
                                const Icon = tip.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                                        className="flex items-start gap-2 rounded-lg bg-white/60 p-2"
                                    >
                                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600" />
                                        <span className="text-xs text-neutral-600">{tip.text}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Multi-Step Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4 rounded-2xl border border-indigo-100/50 bg-white/70 p-6 shadow-lg shadow-indigo-100/60 backdrop-blur-sm"
                    >
                            {/* Step 1: Course Goal and Learning Outcome */}
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

                                    <div className="flex justify-end gap-3">
                                        <MyButton
                                            buttonType="primary"
                                            onClick={handleNextStep}
                                            disabled={!courseGoal.trim()}
                                        >
                                            Next
                                        </MyButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Learner Profile */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                                            Learner Profile
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="ageRange" className="mb-2 block">
                                                    Age Range
                                                </Label>
                                                <Input
                                                    id="ageRange"
                                                    value={ageRange}
                                                    onChange={(e) => setAgeRange(e.target.value)}
                                                    placeholder="e.g., 18-25, 25-35, etc. (Optional)"
                                                    className="w-full"
                                                />
                                            </div>

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
                                </div>
                            </div>

                                    <div className="flex justify-end gap-3">
                                        <MyButton
                                            buttonType="secondary"
                                            onClick={handleBackStep}
                                        >
                                            Back
                                        </MyButton>
                                        <MyButton
                                            buttonType="primary"
                                            onClick={handleNextStep}
                                        >
                                            Next
                                        </MyButton>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Format and Structure */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-xl font-semibold text-neutral-900">
                                            Duration, Format, and Structure
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="numberOfSessions" className="mb-2 block">
                                                    Number of Sessions
                                                </Label>
                                                <Input
                                                    id="numberOfSessions"
                                                    type="number"
                                                    min="1"
                                                    value={numberOfSessions}
                                                    onChange={(e) => setNumberOfSessions(e.target.value)}
                                                    placeholder="e.g., 8"
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="sessionLength" className="mb-2 block">
                                                    Session Length
                                                </Label>
                                                <div className="space-y-2">
                                                    <Select value={sessionLength} onValueChange={handleSessionLengthChange}>
                                                        <SelectTrigger id="sessionLength" className="w-full">
                                                            <SelectValue placeholder="Select session length" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="45">45 minutes</SelectItem>
                                                            <SelectItem value="60">60 minutes</SelectItem>
                                                            <SelectItem value="90">90 minutes</SelectItem>
                                                            <SelectItem value="custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {sessionLength === 'custom' && (
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={customSessionLength}
                                                            onChange={(e) => setCustomSessionLength(e.target.value)}
                                                            placeholder="Enter custom length in minutes"
                                                            className="w-full"
                                                        />
                                                    )}
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
                                                            Include homework
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

                                            <div>
                                                <Label htmlFor="topicsPerSession" className="mb-2 block">
                                                    Topics per Session
                                                </Label>
                                                <Input
                                                    id="topicsPerSession"
                                                    type="number"
                                                    min="1"
                                                    value={topicsPerSession}
                                                    onChange={(e) => setTopicsPerSession(e.target.value)}
                                                    placeholder="e.g., 2, 3, 4, etc."
                                                    className="w-full"
                                                />
                                            </div>

                                            <div>
                                                <Label className="mb-2 block">Topics (Optional)</Label>
                                                <div className="space-y-3">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={newTopic}
                                                            onChange={(e) => setNewTopic(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && newTopic.trim()) {
                                                                    e.preventDefault();
                                                                    if (!topics.includes(newTopic.trim())) {
                                                                        setTopics([...topics, newTopic.trim()]);
                                                                    }
                                                                    setNewTopic('');
                                                                }
                                                            }}
                                                            placeholder="Enter a topic and press Enter"
                                                            className="flex-1"
                                                        />
                                                        <MyButton
                                                            buttonType="secondary"
                                                            onClick={() => {
                                                                if (newTopic.trim() && !topics.includes(newTopic.trim())) {
                                                                    setTopics([...topics, newTopic.trim()]);
                                                                    setNewTopic('');
                                                                }
                                                            }}
                                                            disabled={!newTopic.trim() || topics.includes(newTopic.trim())}
                                                        >
                                                            Add
                                                        </MyButton>
                                                    </div>

                                                    {topics.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {topics.map((topic, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1.5 text-xs text-indigo-700"
                                                                >
                                                                    <span>{topic}</span>
                                            <button
                                                type="button"
                                                                        onClick={() => setTopics(topics.filter((_, i) => i !== index))}
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

                                    <div>
                                        <Label className="mb-2 block">References (Optional)</Label>
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
                                                    Attach PDF or DOCX files
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

                                    <div className="flex justify-end gap-3">
                                        <MyButton
                                            buttonType="secondary"
                                            onClick={handleBackStep}
                                        >
                                            Back
                                        </MyButton>
                                        <MyButton
                                            buttonType="primary"
                                            onClick={handleSubmitCourseConfig}
                                        >
                                            Generate Course
                                        </MyButton>
                                    </div>
                                </div>
                            )}
                    </motion.div>

                    {/* Example Prompts Section - 2 Lines Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
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
                </div>
            </div>
        </LayoutContainer>
    );
}
