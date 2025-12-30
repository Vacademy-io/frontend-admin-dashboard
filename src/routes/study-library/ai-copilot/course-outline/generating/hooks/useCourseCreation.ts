import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { SessionProgress } from '../../../shared/types';
import { createCourseWithContent, setProgressCallback } from '../services/courseCreationService';

/**
 * Custom hook for handling course creation
 */
export const useCourseCreation = (
    courseMetadata: any,
    sessionsWithProgress: SessionProgress[]
) => {
    const navigate = useNavigate();
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [creationProgress, setCreationProgress] = useState<string>('');

    // Set progress callback for the service
    useEffect(() => {
        setProgressCallback(setCreationProgress);
    }, []);

    const handleCreateCourse = async () => {
        if (!courseMetadata) {
            toast.error('Course metadata not found. Please regenerate the course outline.');
            return;
        }

        if (!sessionsWithProgress || sessionsWithProgress.length === 0) {
            toast.error('No sessions found. Please generate content first.');
            return;
        }

        setIsCreatingCourse(true);
        setCreationProgress('Initializing course creation...');

        try {
            // Extract course name - check multiple possible field names
            const courseName = courseMetadata.course_name || courseMetadata.courseName || courseMetadata.title || 'New Course';
            console.log('[Course Creation] Extracted course name:', courseName);

            setCreationProgress('Creating course...');
            // Extract metadata fields - handle both API response format and UI format
            const metadata = {
                aboutCourse: courseMetadata.aboutCourse || courseMetadata.about_the_course_html || courseMetadata.aboutCourse || '',
                learningOutcome: courseMetadata.learningOutcome || courseMetadata.why_learn_html || courseMetadata.why_learn || '',
                targetAudience: courseMetadata.targetAudience || courseMetadata.who_should_learn_html || courseMetadata.who_should_learn || '',
                description: courseMetadata.description || courseMetadata.course_html_description || courseMetadata.courseDescription || '',
                coursePreview: courseMetadata.coursePreview || courseMetadata.course_preview_image_media_id || courseMetadata.mediaImageUrl || courseMetadata.previewImageUrl || '',
                courseBanner: courseMetadata.courseBanner || courseMetadata.course_banner_media_id || courseMetadata.bannerImageUrl || '',
                courseMedia: courseMetadata.courseMedia || (courseMetadata.course_media_id ? (typeof courseMetadata.course_media_id === 'string' ? JSON.parse(courseMetadata.course_media_id) : courseMetadata.course_media_id) : null),
                tags: courseMetadata.tags || [],
                levelStructure: courseMetadata.course_depth || courseMetadata.levelStructure || courseMetadata.depth || 2,
            };
            
            console.log('[Course Creation] Full courseMetadata object:', courseMetadata);
            console.log('[Course Creation] Course metadata being sent:', metadata);
            console.log('[Course Creation] Course name:', courseName);
            console.log('[Course Creation] Number of sessions:', sessionsWithProgress.length);
            console.log('[Course Creation] Total slides:', sessionsWithProgress.reduce((sum, session) => sum + session.slides.length, 0));
            
            const result = await createCourseWithContent({
                courseName,
                sessions: sessionsWithProgress,
                courseMetadata: metadata,
            });

            setCreationProgress('Course created successfully!');
            toast.success('Course created successfully!');

            // Navigate to the course details page
            console.log('[Course Creation] Navigating to course:', result.courseId);
            setTimeout(() => {
                navigate({
                    to: '/study-library/courses/course-details',
                    search: { courseId: result.courseId },
                });
            }, 1000);
        } catch (error) {
            console.error('Error creating course:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
            toast.error(errorMessage);
            setCreationProgress('');
        } finally {
            setIsCreatingCourse(false);
        }
    };

    return {
        handleCreateCourse,
        isCreatingCourse,
        creationProgress,
    };
};
