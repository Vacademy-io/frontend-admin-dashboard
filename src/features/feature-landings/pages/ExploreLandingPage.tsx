import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { LoginDialog } from '../components/LoginDialog';
import {
    Video,
    FileQuestion,
    BookOpen,
    FileText,
    Gamepad2,
    GraduationCap,
    Sparkles,
    ArrowRight,
    Play,
    CheckCircle2,
    Circle,
    ChevronRight,
    FolderOpen,
    FileVideo,
    Clock,
    Users,
    BarChart3,
    Plus,
    Search,
    Bell,
    Settings,
    LayoutGrid,
} from 'lucide-react';

// ── Visual mock components ──────────────────────────────────────────

function HeroDashboardMock() {
    return (
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-neutral-800 px-3 py-2">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 h-5 w-48 rounded bg-neutral-800" />
            </div>
            <div className="flex">
                {/* Sidebar */}
                <div className="hidden w-44 shrink-0 border-r border-neutral-800 p-3 sm:block">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="size-6 rounded bg-emerald-500" />
                        <div className="h-3 w-16 rounded bg-neutral-700" />
                    </div>
                    {['Dashboard', 'My Content', 'Courses', 'Analytics'].map((item, i) => (
                        <div
                            key={item}
                            className={`mb-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${i === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'text-neutral-500'}`}
                        >
                            {i === 0 && <LayoutGrid className="size-3" />}
                            {i === 1 && <FolderOpen className="size-3" />}
                            {i === 2 && <GraduationCap className="size-3" />}
                            {i === 3 && <BarChart3 className="size-3" />}
                            {item}
                        </div>
                    ))}
                </div>
                {/* Main content */}
                <div className="flex-1 p-3 sm:p-4">
                    {/* Top bar */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search className="size-3.5 text-neutral-600" />
                            <div className="h-3 w-24 rounded bg-neutral-800" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Bell className="size-3.5 text-neutral-600" />
                            <Settings className="size-3.5 text-neutral-600" />
                            <div className="size-5 rounded-full bg-emerald-500/30" />
                        </div>
                    </div>
                    {/* Stats row */}
                    <div className="mb-4 grid grid-cols-3 gap-2">
                        {[
                            { label: 'Videos', value: '24', color: 'text-blue-400' },
                            { label: 'Quizzes', value: '18', color: 'text-amber-400' },
                            { label: 'Courses', value: '6', color: 'text-emerald-400' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-lg border border-neutral-800 bg-neutral-800/50 p-2"
                            >
                                <div className={`text-sm font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-[9px] text-neutral-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    {/* Create New button */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="text-[10px] font-semibold text-neutral-300">
                            Recent Projects
                        </div>
                        <div className="flex items-center gap-1 rounded-md bg-emerald-500 px-2 py-1 text-[9px] font-semibold text-white">
                            <Plus className="size-2.5" />
                            Create New
                        </div>
                    </div>
                    {/* Content cards */}
                    <div className="space-y-2">
                        {[
                            {
                                name: 'Photosynthesis Explainer',
                                type: 'Video',
                                status: 'Published',
                                icon: FileVideo,
                                color: 'bg-blue-500',
                            },
                            {
                                name: 'Math Quiz — Algebra',
                                type: 'Quiz',
                                status: 'Draft',
                                icon: FileQuestion,
                                color: 'bg-amber-500',
                            },
                            {
                                name: 'Solar System Story',
                                type: 'Storybook',
                                status: 'Generating...',
                                icon: BookOpen,
                                color: 'bg-rose-500',
                            },
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2 rounded-lg border border-neutral-800 p-2"
                            >
                                <div
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-md ${item.color === 'bg-blue-500' ? 'bg-blue-500/15' : item.color === 'bg-amber-500' ? 'bg-amber-500/15' : 'bg-rose-500/15'}`}
                                >
                                    <item.icon
                                        className={`size-3.5 ${item.color.replace('bg-', 'text-')}`}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[10px] font-medium text-neutral-200">
                                        {item.name}
                                    </div>
                                    <div className="text-[8px] text-neutral-500">{item.type}</div>
                                </div>
                                <div
                                    className={`rounded-full px-1.5 py-0.5 text-[7px] font-medium ${
                                        item.status === 'Published'
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : item.status === 'Draft'
                                              ? 'bg-neutral-700 text-neutral-400'
                                              : 'bg-amber-500/15 text-amber-400'
                                    }`}
                                >
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function VideoPreviewMock() {
    return (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900">
            <div className="relative aspect-video bg-neutral-800">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                        <Play className="ml-0.5 size-5 text-white" />
                    </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-neutral-900/80 px-3 py-2 backdrop-blur-sm">
                    <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-neutral-700">
                        <div className="h-full w-2/5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-400">
                        <span>2:14 / 5:30</span>
                        <span>HD</span>
                    </div>
                </div>
                {/* Fake visual content */}
                <div className="absolute left-4 top-4 max-w-[60%]">
                    <div className="mb-2 h-3 w-32 rounded bg-white/10" />
                    <div className="mb-1 h-2 w-full rounded bg-white/5" />
                    <div className="h-2 w-3/4 rounded bg-white/5" />
                </div>
                <div className="absolute bottom-12 right-4 top-4 hidden w-1/3 rounded-lg border border-white/10 bg-white/5 sm:block" />
            </div>
            <div className="p-3">
                <div className="text-xs font-semibold text-white">Photosynthesis — Class 5</div>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-neutral-400">
                    <span className="flex items-center gap-1">
                        <Clock className="size-3" /> 5:30
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="size-3" /> Grade 5
                    </span>
                </div>
            </div>
        </div>
    );
}

function QuizPreviewMock() {
    return (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 bg-amber-50 px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold text-amber-700">
                        Math Quiz — Algebra
                    </div>
                    <div className="rounded-full bg-amber-100 px-2 py-0.5 text-[8px] font-medium text-amber-600">
                        Q 3 of 10
                    </div>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-amber-100">
                    <div className="h-full w-[30%] rounded-full bg-amber-500" />
                </div>
            </div>
            <div className="p-4">
                <div className="mb-3 text-xs font-medium text-neutral-800">
                    Solve for x: 2x + 5 = 15
                </div>
                <div className="space-y-1.5">
                    {['x = 5', 'x = 10', 'x = 7.5', 'x = 3'].map((opt, i) => (
                        <div
                            key={opt}
                            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-[10px] ${
                                i === 0
                                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700'
                                    : 'border-neutral-200 text-neutral-600'
                            }`}
                        >
                            {i === 0 ? (
                                <CheckCircle2 className="size-3 text-emerald-500" />
                            ) : (
                                <Circle className="size-3 text-neutral-300" />
                            )}
                            {opt}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StoryPreviewMock() {
    return (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="aspect-[4/3] bg-rose-50 p-4">
                {/* Illustration placeholder */}
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-rose-200">
                    <div className="text-center">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-rose-100">
                            <BookOpen className="size-5 text-rose-500" />
                        </div>
                        <div className="mb-1 h-2 w-20 rounded bg-rose-200" />
                        <div className="mx-auto h-2 w-14 rounded bg-rose-100" />
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="text-xs font-semibold text-neutral-800">
                    The Journey of a Water Drop
                </div>
                <div className="mt-1 text-[10px] leading-relaxed text-neutral-500">
                    Once upon a time, a tiny water drop lived high above the clouds...
                </div>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-rose-500">
                    Page 1 of 12 <ChevronRight className="size-3" />
                </div>
            </div>
        </div>
    );
}

function WizardMock() {
    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
            {/* Steps indicator */}
            <div className="border-b border-neutral-100 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-center justify-between">
                    {['Content Type', 'Configure', 'Generate'].map((label, i) => (
                        <div key={label} className="flex items-center gap-1.5 sm:gap-2">
                            <div
                                className={`flex size-6 items-center justify-center rounded-full text-[10px] font-bold sm:size-7 sm:text-xs ${
                                    i === 0
                                        ? 'bg-emerald-500 text-white'
                                        : i === 1
                                          ? 'border-2 border-emerald-500 text-emerald-500'
                                          : 'border-2 border-neutral-200 text-neutral-400'
                                }`}
                            >
                                {i === 0 ? <CheckCircle2 className="size-3.5 sm:size-4" /> : i + 1}
                            </div>
                            <span
                                className={`text-[10px] font-medium sm:text-xs ${
                                    i <= 1 ? 'text-neutral-800' : 'text-neutral-400'
                                }`}
                            >
                                {label}
                            </span>
                            {i < 2 && (
                                <ChevronRight className="mx-0.5 size-3 text-neutral-300 sm:mx-1 sm:size-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Form content */}
            <div className="p-4 sm:p-6">
                <div className="mb-1 text-xs font-semibold text-neutral-800 sm:text-sm">
                    Configure your Video
                </div>
                <div className="mb-4 text-[10px] text-neutral-500 sm:mb-5 sm:text-xs">
                    Set the topic, audience, and style for your AI-generated video
                </div>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <div className="mb-1 text-[10px] font-medium text-neutral-600">
                            Topic / Prompt
                        </div>
                        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] text-neutral-700 sm:text-xs">
                            Photosynthesis for Class 5 students
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <div className="mb-1 text-[10px] font-medium text-neutral-600">
                                Target Audience
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] text-neutral-700 sm:text-xs">
                                Grade 5 (Age 10-11)
                                <ChevronRight className="size-3 rotate-90 text-neutral-400" />
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-[10px] font-medium text-neutral-600">
                                Language
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-[10px] text-neutral-700 sm:text-xs">
                                English
                                <ChevronRight className="size-3 rotate-90 text-neutral-400" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="mb-1 text-[10px] font-medium text-neutral-600">
                                Duration
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {['Short', 'Medium', 'Long'].map((d, i) => (
                                    <div
                                        key={d}
                                        className={`rounded-md px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px] ${
                                            i === 1
                                                ? 'bg-emerald-500 text-white'
                                                : 'border border-neutral-200 text-neutral-500'
                                        }`}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 text-[10px] font-medium text-neutral-600">
                                Voice
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {['Female', 'Male'].map((v, i) => (
                                    <div
                                        key={v}
                                        className={`rounded-md px-2 py-1 text-[9px] font-medium sm:px-2.5 sm:text-[10px] ${
                                            i === 0
                                                ? 'bg-emerald-500 text-white'
                                                : 'border border-neutral-200 text-neutral-500'
                                        }`}
                                    >
                                        {v}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 flex justify-end sm:mt-6">
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-semibold text-white sm:px-4 sm:py-2 sm:text-xs">
                        <Sparkles className="size-3 sm:size-3.5" />
                        Generate Video
                    </div>
                </div>
            </div>
        </div>
    );
}

function CourseStructureMock() {
    const modules = [
        {
            name: 'Module 1: Introduction to Biology',
            items: [
                { name: 'What is Biology?', type: 'Video', icon: Video, color: 'text-blue-500' },
                { name: 'Quick Check', type: 'Quiz', icon: FileQuestion, color: 'text-amber-500' },
            ],
            expanded: true,
        },
        {
            name: 'Module 2: Cell Structure',
            items: [
                { name: 'Parts of a Cell', type: 'Video', icon: Video, color: 'text-blue-500' },
                {
                    name: 'Cell Story',
                    type: 'Storybook',
                    icon: BookOpen,
                    color: 'text-rose-500',
                },
                {
                    name: 'Label the Cell',
                    type: 'Worksheet',
                    icon: FileText,
                    color: 'text-emerald-500',
                },
                {
                    name: 'Module Assessment',
                    type: 'Quiz',
                    icon: FileQuestion,
                    color: 'text-amber-500',
                },
            ],
            expanded: true,
        },
        {
            name: 'Module 3: Photosynthesis',
            items: [],
            expanded: false,
        },
    ];

    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                <div>
                    <div className="text-xs font-semibold text-neutral-800">Biology — Grade 7</div>
                    <div className="text-[10px] text-neutral-500">
                        AI-generated course structure
                    </div>
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
                    3 Modules • 7 Items
                </div>
            </div>
            <div className="p-3">
                {modules.map((mod, mi) => (
                    <div key={mod.name} className={mi > 0 ? 'mt-2' : ''}>
                        <div className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2">
                            <ChevronRight
                                className={`size-3 text-neutral-400 transition-transform ${mod.expanded ? 'rotate-90' : ''}`}
                            />
                            <FolderOpen className="size-3.5 text-emerald-500" />
                            <span className="text-[10px] font-semibold text-neutral-700">
                                {mod.name}
                            </span>
                        </div>
                        {mod.expanded && mod.items.length > 0 && (
                            <div className="ml-5 mt-1 space-y-0.5 border-l border-neutral-100 pl-3">
                                {mod.items.map((item) => (
                                    <div
                                        key={item.name}
                                        className="flex items-center gap-2 rounded-md px-2 py-1.5"
                                    >
                                        <item.icon className={`size-3 ${item.color}`} />
                                        <span className="text-[10px] text-neutral-600">
                                            {item.name}
                                        </span>
                                        <span className="ml-auto rounded bg-neutral-100 px-1.5 py-0.5 text-[7px] text-neutral-400">
                                            {item.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {!mod.expanded && (
                            <div className="ml-8 mt-1 text-[9px] italic text-neutral-400">
                                3 items collapsed
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Main page ───────────────────────────────────────────────────────

export default function ExploreLandingPage() {
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <div className="fixed inset-0 overflow-y-auto bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <span className="text-xl font-bold tracking-tight text-neutral-900">
                        Vacademy
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 sm:px-4"
                        >
                            Login
                        </button>
                        <Link
                            to="/signup/onboarding"
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:px-4"
                        >
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-neutral-950 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-8 py-12 sm:gap-10 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
                    {/* Left — copy */}
                    <div className="text-center lg:text-left">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:mb-5 sm:text-sm">
                            <Sparkles className="size-3 sm:size-3.5" />
                            AI-Powered
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                            Create educational content{' '}
                            <span className="text-emerald-400">in minutes</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 sm:mt-5 sm:text-lg lg:mx-0">
                            Generate videos, quizzes, storybooks, worksheets, games, and full
                            courses — all powered by AI.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
                            <Link
                                to="/signup/onboarding"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 sm:px-6 sm:py-3 sm:text-base"
                            >
                                Get Started Free
                                <ArrowRight className="size-4" />
                            </Link>
                            <button
                                onClick={() => setLoginOpen(true)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white sm:px-6 sm:py-3 sm:text-base"
                            >
                                Login to Dashboard
                            </button>
                        </div>
                    </div>
                    {/* Right — Dashboard mock */}
                    <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
                        <HeroDashboardMock />
                    </div>
                </div>
            </section>

            {/* Content Types — visual previews */}
            <section className="px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 max-w-2xl sm:mb-12">
                        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                            What you can create
                        </h2>
                        <p className="mt-2 text-sm text-neutral-500 sm:mt-3 sm:text-lg">
                            Six content types, one platform. Here&apos;s a preview.
                        </p>
                    </div>

                    {/* Mobile: horizontal scroll of visual mocks */}
                    <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:hidden">
                        <div className="w-[280px] shrink-0">
                            <VideoPreviewMock />
                            <div className="mt-2 flex items-center gap-2">
                                <Video className="size-4 text-blue-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    AI Videos
                                </span>
                            </div>
                        </div>
                        <div className="w-[260px] shrink-0">
                            <QuizPreviewMock />
                            <div className="mt-2 flex items-center gap-2">
                                <FileQuestion className="size-4 text-amber-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    Smart Quizzes
                                </span>
                            </div>
                        </div>
                        <div className="w-[260px] shrink-0">
                            <StoryPreviewMock />
                            <div className="mt-2 flex items-center gap-2">
                                <BookOpen className="size-4 text-rose-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    Storybooks
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: grid of visual mocks */}
                    <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <VideoPreviewMock />
                            <div className="mt-3 flex items-center gap-2">
                                <Video className="size-4 text-blue-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    AI Videos
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                Narrated explainer videos with AI-generated visuals and voiceover
                            </p>
                        </div>
                        <div>
                            <QuizPreviewMock />
                            <div className="mt-3 flex items-center gap-2">
                                <FileQuestion className="size-4 text-amber-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    Smart Quizzes
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                Auto-generated assessments with multiple question types
                            </p>
                        </div>
                        <div>
                            <StoryPreviewMock />
                            <div className="mt-3 flex items-center gap-2">
                                <BookOpen className="size-4 text-rose-500" />
                                <span className="text-sm font-semibold text-neutral-800">
                                    Storybooks
                                </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                Illustrated narratives that make learning fun for younger students
                            </p>
                        </div>
                    </div>

                    {/* Row 2: remaining types as compact cards */}
                    <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
                        {[
                            {
                                icon: FileText,
                                title: 'Worksheets',
                                desc: 'Printable homework and practice materials',
                                color: 'text-emerald-500',
                                bg: 'bg-emerald-50',
                            },
                            {
                                icon: Gamepad2,
                                title: 'Interactive Games',
                                desc: 'Memory match, drag & drop activities',
                                color: 'text-violet-500',
                                bg: 'bg-violet-50',
                            },
                            {
                                icon: GraduationCap,
                                title: 'Full Courses',
                                desc: 'Complete course structures with AI-organized content',
                                color: 'text-orange-500',
                                bg: 'bg-orange-50',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 transition-all hover:border-neutral-300 hover:shadow-sm sm:gap-4 sm:p-4"
                            >
                                <div
                                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 ${item.bg}`}
                                >
                                    <item.icon className={`size-4 sm:size-5 ${item.color}`} />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-neutral-800">
                                        {item.title}
                                    </div>
                                    <div className="mt-0.5 text-xs text-neutral-500">
                                        {item.desc}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works — with wizard mock */}
            <section className="bg-neutral-50 px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                How it works
                            </h2>
                            <p className="mt-2 text-sm text-neutral-500 sm:mt-3 sm:text-base">
                                A guided wizard takes you from idea to published content in three
                                simple steps.
                            </p>
                            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-6">
                                {[
                                    {
                                        step: 1,
                                        title: 'Choose Content Type',
                                        desc: 'Pick from videos, quizzes, storybooks, worksheets, games, or courses',
                                        color: 'bg-emerald-500',
                                    },
                                    {
                                        step: 2,
                                        title: 'Configure & Customize',
                                        desc: 'Set topic, audience, language, duration, and type-specific options',
                                        color: 'bg-blue-500',
                                    },
                                    {
                                        step: 3,
                                        title: 'Generate & Publish',
                                        desc: 'AI creates your content — review, edit, and share with students',
                                        color: 'bg-amber-500',
                                    },
                                ].map((item) => (
                                    <div key={item.step} className="flex gap-3 sm:gap-4">
                                        <div
                                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white sm:size-9 sm:text-sm ${item.color}`}
                                        >
                                            {item.step}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-neutral-800">
                                                {item.title}
                                            </div>
                                            <div className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Wizard mock */}
                        <WizardMock />
                    </div>
                </div>
            </section>

            {/* AI Course Creation — with structure mock */}
            <section className="px-4 py-12 sm:px-6 sm:py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid items-start gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 sm:mb-4 sm:text-sm">
                                <GraduationCap className="size-3 sm:size-3.5" />
                                AI Course Builder
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                                Build full courses with AI
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-neutral-500 sm:mt-4 sm:text-base">
                                Describe your subject and grade level — AI generates a complete
                                course with structured modules, multi-format content, and curriculum
                                alignment. Review, customize, and publish.
                            </p>
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3">
                                {[
                                    'Auto-structured modules',
                                    'Topic-based generation',
                                    'Multi-format per module',
                                    'Curriculum alignment',
                                ].map((feat) => (
                                    <div key={feat} className="flex items-center gap-2">
                                        <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500 sm:size-4" />
                                        <span className="text-xs text-neutral-700 sm:text-sm">
                                            {feat}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 sm:mt-8">
                                <Link
                                    to="/signup/onboarding"
                                    className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 sm:px-5 sm:py-2.5"
                                >
                                    Try Course Builder
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                        {/* Course structure mock */}
                        <CourseStructureMock />
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="border-t border-neutral-200 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <Sparkles className="mx-auto size-7 text-emerald-400 sm:size-8" />
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:mt-5 sm:text-4xl">
                        Ready to create with AI?
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm text-neutral-400 sm:mt-4 sm:text-base">
                        Join educators saving hours every week with AI-powered content generation.
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row sm:gap-4">
                        <Link
                            to="/signup/onboarding"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                        >
                            Get Started Free
                            <ArrowRight className="size-4" />
                        </Link>
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white sm:w-auto sm:px-6 sm:py-3 sm:text-base"
                        >
                            Login to Dashboard
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-800 bg-neutral-950 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl text-center">
                    <p className="text-sm text-neutral-500">
                        &copy; {new Date().getFullYear()} Vacademy. All rights reserved.
                    </p>
                </div>
            </footer>

            <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
        </div>
    );
}
