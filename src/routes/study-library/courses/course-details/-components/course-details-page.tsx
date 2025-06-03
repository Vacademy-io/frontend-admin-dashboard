import { Steps } from '@phosphor-icons/react';
import { useRouter } from '@tanstack/react-router';
import {
    ChalkboardTeacher,
    Clock,
    Code,
    File,
    FileDoc,
    FilePdf,
    PlayCircle,
    Question,
} from 'phosphor-react';

export const CourseDetailsPage = () => {
    const router = useRouter();
    const searchParams = router.state.location.search;

    // Mock data for static display
    const courseData = {
        title: 'Advanced Web Development Bootcamp',
        description:
            'Master modern web development with this comprehensive course covering React, Node.js, and more.',
        tags: ['Web Development', 'React', 'Node.js', 'Full Stack'],
        imageUrl: 'https://example.com/course-banner.jpg',
        stats: {
            students: 1234,
            rating: 4.8,
            reviews: 256,
            lastUpdated: 'December 2023',
        },
        whatYoullLearn: [
            'Build full-stack web applications using React and Node.js',
            'Master modern JavaScript ES6+ features',
            'Implement authentication and authorization',
            'Deploy applications to production',
        ],
        instructors: [
            {
                name: 'John Doe',
                role: 'Senior Web Developer',
                bio: '10+ years of experience in web development',
            },
        ],
    };

    return (
        <div className="flex min-h-screen flex-col bg-white">
            {/* Top Banner */}
            <div className="relative h-[300px] bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-start justify-between gap-8">
                        {/* Left side - Title and Description */}
                        <div className="max-w-2xl">
                            <div className="mb-4 flex gap-2">
                                {courseData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-blue-600 px-3 py-1 text-sm"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="mb-4 text-4xl font-bold">{courseData.title}</h1>
                            <p className="text-lg opacity-90">{courseData.description}</p>
                        </div>

                        {/* Right side - Video Player */}
                        <div className="w-[400px] overflow-hidden rounded-lg shadow-xl">
                            <div className="relative aspect-video bg-black">
                                {/* Video placeholder - replace with actual video component */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                                        <svg
                                            className="h-8 w-8 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                <div className="flex gap-8">
                    {/* Left Column - 2/3 width */}
                    <div className="w-2/3 flex-grow">
                        {/* What You'll Learn Section */}
                        <div className="mb-8 rounded-lg bg-gray-50 p-6">
                            <h2 className="mb-4 text-2xl font-bold">What You'll Learn</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {courseData.whatYoullLearn.map((item, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <svg
                                            className="h-6 w-6 flex-shrink-0 text-green-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Course Content</h2>
                            <div className="rounded-lg border">
                                <div className="border-b p-4">
                                    <h3 className="font-semibold">Section 1: Introduction</h3>
                                    <p className="text-sm text-gray-600">4 lectures • 45 min</p>
                                </div>
                                <div className="border-b p-4">
                                    <h3 className="font-semibold">Section 2: Getting Started</h3>
                                    <p className="text-sm text-gray-600">6 lectures • 1h 15min</p>
                                </div>
                                {/* Add more sections as needed */}
                            </div>
                        </div>

                        {/* Instructors Section */}
                        <div className="mb-8">
                            <h2 className="mb-4 text-2xl font-bold">Instructors</h2>
                            {courseData.instructors.map((instructor, index) => (
                                <div key={index} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                                    <div className="h-16 w-16 rounded-full bg-gray-300"></div>
                                    <div>
                                        <h3 className="text-lg font-bold">{instructor.name}</h3>
                                        <p className="text-gray-600">{instructor.role}</p>
                                        <p className="mt-2">{instructor.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="w-1/3">
                        <div className="sticky top-4 rounded-lg border bg-white p-6 shadow-lg">
                            {/* Course Stats */}
                            <h2 className="mb-4 text-lg font-bold">
                                Scratch Programming Language
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Steps size={18} />
                                    <span>Beginner</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} />
                                    <span> 1 hr 38 min</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle size={18} />
                                    <span>11 Vidoes slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Code size={18} />
                                    <span>8 Code slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FilePdf size={18} />
                                    <span>2 Pdf slides</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileDoc size={18} />
                                    <span>1 Doc slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Question size={18} />
                                    <span>1 Question slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <File size={18} />
                                    <span>1 Assignment slide</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChalkboardTeacher size={18} />
                                    <span>Satya Dillikar, Savir Dillikar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
