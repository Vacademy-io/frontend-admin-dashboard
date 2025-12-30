import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { getInstituteId } from '@/constants/helper';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import {
    ADD_COURSE,
    ADD_SUBJECT,
    ADD_MODULE,
    ADD_CHAPTER,
    ADD_UPDATE_DOCUMENT_SLIDE,
    ADD_UPDATE_VIDEO_SLIDE,
    ADD_UPDATE_QUIZ_SLIDE,
} from '@/constants/urls';
import { SlideGeneration, SessionProgress } from '../../../shared/types';
import { fetchInstituteDetails } from '@/services/student-list-section/getInstituteDetails';
import { BatchForSessionType } from '@/schemas/student/student-list/institute-schema';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';

interface CreateCourseParams {
    courseName: string;
    durationInDays?: number;
    sessions: SessionProgress[];
    courseMetadata?: {
        aboutCourse?: string;
        learningOutcome?: string;
        targetAudience?: string;
        description?: string;
        coursePreview?: string;
        courseBanner?: string;
        courseMedia?: any;
        tags?: string[];
        levelStructure?: number;
    };
}

interface CreateCourseResult {
    courseId: string;
    packageSessionIds: string;
    subjectId: string;
    moduleId: string;
    chapterIds: string[];
}

/**
 * Helper function to find package session IDs by package ID
 */
function findIdByPackageId(data: BatchForSessionType[], packageId: string): string {
    return data
        .filter((item) => item.package_dto?.id === packageId)
        .map((item) => item.id)
        .join(',');
}

/**
 * Creates a course with all its content
 * Flow: Create Course -> Get PackageSessionIds -> Create Subject -> Module -> Chapters -> Slides
 */
export async function createCourseWithContent(params: CreateCourseParams): Promise<CreateCourseResult> {
    const { courseName, sessions, courseMetadata } = params;
    
    // Remove unused variable
    // const instituteId = getInstituteId(); // Not needed, using INSTITUTE_ID instead

    // Step 1: Create Course (Package)
    // Get INSTITUTE_ID - use getCurrentInstituteId which handles localStorage and token fallback
    let INSTITUTE_ID = getCurrentInstituteId();
    
    // Fallback to getInstituteId if getCurrentInstituteId fails
    if (!INSTITUTE_ID) {
        INSTITUTE_ID = getInstituteId();
    }
    
    // Get token data for user info and institute ID
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    if (!accessToken) {
        throw new Error('Access token not found. Please log in again.');
    }
    
    const tokenData = getTokenDecodedData(accessToken);
    if (!tokenData) {
        throw new Error('Failed to decode token data. Please log in again.');
    }
    
    // If INSTITUTE_ID not found yet, try to get from token
    if (!INSTITUTE_ID && tokenData.authorities) {
        INSTITUTE_ID = Object.keys(tokenData.authorities)[0];
    }
    
    if (!INSTITUTE_ID) {
        throw new Error('Institute ID not found. Please ensure you are logged in and have selected an institute.');
    }

    // Get user data for approval workflow
    const isAdmin =
        tokenData?.authorities &&
        Object.values(tokenData.authorities).some((auth: any) =>
            auth?.roles?.includes('ADMIN')
        );

    // Helper function to validate file IDs (should be UUIDs, not filenames)
    const isValidFileId = (fileId: string | undefined | null): boolean => {
        if (!fileId || fileId.trim() === '') return false;
        // Check if it's a UUID format (basic check)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        // Also check if it ends with common image extensions (which means it's a filename, not an ID)
        const isFilename = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileId);
        return uuidRegex.test(fileId) && !isFilename;
    };

    const previewImageId = courseMetadata?.coursePreview && isValidFileId(courseMetadata.coursePreview) 
        ? courseMetadata.coursePreview 
        : '';
    const bannerImageId = courseMetadata?.courseBanner && isValidFileId(courseMetadata.courseBanner) 
        ? courseMetadata.courseBanner 
        : '';

    const coursePayload = {
        id: '',
        new_course: true, // Required by backend - indicates this is a new course
        course_name: courseName,
        thumbnail_file_id: previewImageId,
        contain_levels: false,
        // Course metadata fields
        about_the_course_html: courseMetadata?.aboutCourse || '',
        why_learn_html: courseMetadata?.learningOutcome || '',
        who_should_learn_html: courseMetadata?.targetAudience || '',
        course_html_description: courseMetadata?.description || '',
        course_preview_image_media_id: previewImageId,
        course_banner_media_id: bannerImageId,
        course_media_id: courseMetadata?.courseMedia ? JSON.stringify(courseMetadata.courseMedia) : '',
        tags: courseMetadata?.tags || [],
        course_depth: courseMetadata?.levelStructure || 2,
        // Required fields for course creation
        status: isAdmin ? 'ACTIVE' : 'DRAFT',
        created_by_user_id: tokenData?.user || '',
        original_course_id: null,
        version_number: 1,
        is_course_published_to_catalaouge: false,
        sessions: [
            {
                id: 'DEFAULT',
                session_name: 'DEFAULT',
                status: 'ACTIVE',
                start_date: '',
                new_session: true,
                levels: [
                    {
                        id: 'DEFAULT',
                        new_level: true,
                        level_name: 'DEFAULT',
                        duration_in_days: 0,
                        thumbnail_file_id: '',
                        package_id: '',
                        add_faculty_to_course: [],
                        group: {
                            id: 'DEFAULT',
                            group_name: 'DEFAULT',
                            group_value: '',
                            new_group: true,
                        },
                    },
                ],
            },
        ],
    };

    if (setCreationProgress) {
        setCreationProgress('Creating course...');
    }
    
    // Debug logging
    console.log('[Course Creation] INSTITUTE_ID:', INSTITUTE_ID);
    console.log('[Course Creation] Course payload:', coursePayload);
    console.log('[Course Creation] API URL:', `${ADD_COURSE}/${INSTITUTE_ID}`);
    console.log('[Course Creation] Access token found, length:', accessToken.length);
    
    try {
        let courseResponse;
        try {
            courseResponse = await authenticatedAxiosInstance.post(
                `${ADD_COURSE}/${INSTITUTE_ID}`,
                coursePayload
            );
        } catch (error: any) {
            // Log detailed error information
            console.error('[Course Creation] API Error Details:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                url: error?.config?.url,
                method: error?.config?.method,
                headers: error?.config?.headers,
            });
            
            // Check if it's a 511 error that might actually be a backend error
            if (error?.response?.status === 511) {
                const responseData = error.response?.data;
                console.error('[Course Creation] 511 Response Data:', responseData);
                
                // Check if it's actually a backend error message disguised as 511
                if (responseData?.ex || responseData?.responseCode || responseData?.message) {
                    const backendError = responseData.ex || responseData.responseCode || responseData.message;
                    console.error('[Course Creation] Backend error (511):', backendError);
                    // Don't logout on backend errors - just throw the error
                    throw new Error(`Backend Error: ${backendError}`);
                }
                
                // If it's a real 511, check if INSTITUTE_ID is valid
                if (!INSTITUTE_ID || INSTITUTE_ID === 'undefined' || INSTITUTE_ID === 'null') {
                    throw new Error(`Invalid Institute ID: ${INSTITUTE_ID}. Please ensure you are logged in and have selected an institute.`);
                }
                
                // If it's a real 511 with valid INSTITUTE_ID, provide more context
                throw new Error(`Network authentication required. Please check your connection or contact support. INSTITUTE_ID: ${INSTITUTE_ID}`);
            }
            
            // For other errors, provide the error message
            const errorMessage = error?.response?.data?.ex || error?.response?.data?.message || error?.message || 'Unknown error';
            throw new Error(`Failed to create course: ${errorMessage}`);
        }

        const courseId = courseResponse.data?.id || courseResponse.data?.data || courseResponse.data;
        console.log('[Course Creation] Course created successfully, courseId:', courseId);
        console.log('[Course Creation] Full response data:', courseResponse.data);
        if (!courseId) {
            throw new Error('Failed to create course: No course ID returned');
        }

            // Step 2: Get Institute Details to find batches_for_sessions
        // Try to get from store first (if already loaded), otherwise fetch from API
        if (setCreationProgress) {
            setCreationProgress('Fetching course details...');
        }
        
        let batchesForSessions: BatchForSessionType[] = [];
        
        try {
            // Try to get from store first
            const storeState = useInstituteDetailsStore.getState();
            if (storeState.instituteDetails?.batches_for_sessions) {
                batchesForSessions = storeState.instituteDetails.batches_for_sessions;
            } else {
                // If not in store, fetch from API
                const instituteDetails = await fetchInstituteDetails();
                batchesForSessions = instituteDetails?.batches_for_sessions || [];
            }
        } catch (error) {
            console.warn('Failed to fetch institute details, trying alternative approach:', error);
            // If fetch fails, try to get from store as fallback
            const storeState = useInstituteDetailsStore.getState();
            batchesForSessions = storeState.instituteDetails?.batches_for_sessions || [];
        }
        
        if (!batchesForSessions || batchesForSessions.length === 0) {
            throw new Error('Institute details not loaded. Please refresh the page and try again.');
        }

        // Step 3: Find Package Session IDs for the created course
        let packageSessionIds = findIdByPackageId(batchesForSessions, courseId);
        
        if (!packageSessionIds) {
            // If not found immediately, wait a bit and retry (course might need a moment to be fully created)
            if (setCreationProgress) {
                setCreationProgress('Waiting for course to be fully created...');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try fetching again to get updated batches
            try {
                const instituteDetails = await fetchInstituteDetails();
                const updatedBatches = instituteDetails?.batches_for_sessions || batchesForSessions;
                packageSessionIds = findIdByPackageId(updatedBatches, courseId);
            } catch (error) {
                console.warn('Failed to refetch institute details:', error);
            }
            
            if (!packageSessionIds) {
                throw new Error('Package session IDs not found for the created course. The course may need a moment to be fully created. Please try again in a few seconds.');
            }
        }

        // Step 4: Create Subject
        if (setCreationProgress) {
            setCreationProgress('Creating subject...');
        }
        console.log('[Course Creation] Creating subject:', courseName);
        const subjectPayload = {
            id: crypto.randomUUID(),
            subject_name: courseName,
            subject_code: courseName.substring(0, 3).toUpperCase(),
            credit: 0,
            thumbnail_id: null,
            created_at: '',
            updated_at: '',
        };

        const subjectResponse = await authenticatedAxiosInstance.post(
            `${ADD_SUBJECT}?commaSeparatedPackageSessionIds=${packageSessionIds}`,
            subjectPayload
        );

        const subjectId = subjectResponse.data?.id || subjectResponse.data?.data?.id;
        console.log('[Course Creation] Subject response:', subjectResponse.data);
        if (!subjectId) {
            throw new Error('Failed to create subject: No subject ID returned');
        }
        console.log('[Course Creation] Subject created successfully:', subjectId);

        // Step 5: Create Module
        if (setCreationProgress) {
            setCreationProgress('Creating module...');
        }
        console.log('[Course Creation] Creating module...');
        const modulePayload = {
            id: crypto.randomUUID(),
            module_name: 'Module 1',
            status: 'ACTIVE',
            description: '',
            thumbnail_id: null,
        };

        const moduleResponse = await authenticatedAxiosInstance.post(
            `${ADD_MODULE}?subjectId=${subjectId}&packageSessionId=${packageSessionIds}`,
            modulePayload
        );

        const moduleId = moduleResponse.data?.id || moduleResponse.data?.data?.id;
        console.log('[Course Creation] Module response:', moduleResponse.data);
        if (!moduleId) {
            throw new Error('Failed to create module: No module ID returned');
        }
        console.log('[Course Creation] Module created successfully:', moduleId);

        // Step 6: Create Chapters and Slides for each session
        if (setCreationProgress) {
            setCreationProgress('Creating chapters and slides...');
        }
        const chapterIds: string[] = [];

        console.log(`[Course Creation] Creating ${sessions.length} chapters with slides...`);
        
        for (let sessionIndex = 0; sessionIndex < sessions.length; sessionIndex++) {
            const session = sessions[sessionIndex];
            if (!session) continue;
            console.log(`[Course Creation] Processing session ${sessionIndex + 1}/${sessions.length}: "${session.sessionTitle}" with ${session.slides.length} slides`);

            // Create Chapter
            const chapterPayload = {
                id: crypto.randomUUID(),
                chapter_name: session.sessionTitle,
                status: 'ACTIVE',
                file_id: null,
                description: '',
                chapter_order: sessionIndex,
            };

            try {
                const chapterResponse = await authenticatedAxiosInstance.post(
                    `${ADD_CHAPTER}?subjectId=${subjectId}&moduleId=${moduleId}&commaSeparatedPackageSessionIds=${packageSessionIds}`,
                    chapterPayload
                );

                const chapterId = chapterResponse.data?.id || chapterResponse.data?.data?.id;
                if (!chapterId) {
                    console.error(`[Course Creation] Failed to create chapter for session: ${session.sessionTitle}`, chapterResponse.data);
                    continue;
                }

                console.log(`[Course Creation] Chapter created successfully: ${chapterId} for session "${session.sessionTitle}"`);
                console.log(`[Course Creation] Chapter response full data:`, chapterResponse.data);
                chapterIds.push(chapterId);

                // Step 7: Create Slides for this chapter
                console.log(`[Course Creation] Creating ${session.slides.length} slides for chapter "${session.sessionTitle}"...`);
                for (let slideIndex = 0; slideIndex < session.slides.length; slideIndex++) {
                    const slide = session.slides[slideIndex];
                    if (!slide) continue;
                    if (setCreationProgress) {
                        setCreationProgress(`Creating slide ${slideIndex + 1}/${session.slides.length} in "${session.sessionTitle}"...`);
                    }
                    console.log(`[Course Creation] Creating slide ${slideIndex + 1}/${session.slides.length}: "${slide.slideTitle}" (type: ${slide.slideType})`);
                    try {
                        await createSlide({
                            slide,
                            chapterId,
                            moduleId,
                            subjectId,
                            packageSessionIds,
                            instituteId: INSTITUTE_ID,
                            slideOrder: slideIndex,
                        });
                        console.log(`[Course Creation] Slide "${slide.slideTitle}" created successfully`);
                    } catch (slideError) {
                        console.error(`[Course Creation] Failed to create slide "${slide.slideTitle}":`, slideError);
                        // Continue with next slide instead of failing entire process
                    }
                }
            } catch (chapterError) {
                console.error(`[Course Creation] Failed to create chapter for session "${session.sessionTitle}":`, chapterError);
                // Continue with next session instead of failing entire process
            }
        }
        
        console.log(`[Course Creation] Completed creating ${chapterIds.length} chapters`);

        return {
            courseId,
            packageSessionIds,
            subjectId,
            moduleId,
            chapterIds,
        };
    } catch (error) {
        console.error('Error in createCourseWithContent:', error);
        throw error;
    }
}

// Global progress setter (will be set by the hook)
let setCreationProgress: (progress: string) => void = () => {};

export function setProgressCallback(callback: (progress: string) => void) {
    setCreationProgress = callback;
}

interface CreateSlideParams {
    slide: SlideGeneration;
    chapterId: string;
    moduleId: string;
    subjectId: string;
    packageSessionIds: string;
    instituteId: string;
    slideOrder: number;
}

/**
 * Creates a slide based on its type
 */
async function createSlide(params: CreateSlideParams): Promise<void> {
    const { slide, chapterId, moduleId, subjectId, packageSessionIds, instituteId, slideOrder } = params;

    try {
        switch (slide.slideType) {
            case 'doc':
            case 'objectives':
                await createDocumentSlide(params);
                break;
            case 'video':
            case 'ai-video':
                await createVideoSlide(params);
                break;
            case 'quiz':
            case 'assessment':
                await createQuizSlide(params);
                break;
            case 'video-code':
            case 'ai-video-code':
                // For video+code, we'll create a document slide with the code content
                // The video will be embedded in the document
                await createVideoCodeSlide(params);
                break;
            default:
                // Default to document slide for unknown types
                await createDocumentSlide(params);
                break;
        }
    } catch (error) {
        console.error(`Failed to create slide ${slide.slideTitle}:`, error);
        // Continue with other slides even if one fails
    }
}

/**
 * Creates a document slide
 */
async function createDocumentSlide(params: CreateSlideParams): Promise<void> {
    const { slide, chapterId, moduleId, subjectId, packageSessionIds, instituteId, slideOrder } = params;

    // Get slide content
    const slideContent = slide.content || '';
    console.log(`[Course Creation] Document slide content for "${slide.slideTitle}":`, {
        hasContent: !!slideContent,
        contentLength: slideContent?.length || 0,
        contentPreview: slideContent?.substring(0, 100) || 'No content',
    });

    // Determine slide status - use PUBLISHED for active slides so they're visible
    const slideStatus = 'PUBLISHED'; // Changed from 'ACTIVE' to 'PUBLISHED' so slides are visible
    
    const payload = {
        id: crypto.randomUUID(),
        title: slide.slideTitle,
        image_file_id: '',
        description: null,
        slide_order: slideOrder,
        document_slide: {
            id: crypto.randomUUID(),
            type: 'DOC', // Use 'DOC' instead of 'TEXT' to match existing codebase
            data: slideContent,
            title: slide.slideTitle,
            cover_file_id: '',
            total_pages: 1,
            // Set published_data to content if status is PUBLISHED, otherwise null
            published_data: slideStatus === 'PUBLISHED' ? slideContent : null,
            published_document_total_pages: 1,
        },
        status: slideStatus,
        new_slide: true,
        notify: false,
    };

    const apiUrl = `${ADD_UPDATE_DOCUMENT_SLIDE}?chapterId=${chapterId}&moduleId=${moduleId}&subjectId=${subjectId}&packageSessionId=${packageSessionIds}&instituteId=${instituteId}`;
    console.log(`[Course Creation] Creating document slide API URL:`, apiUrl);
    console.log(`[Course Creation] Document slide - chapterId: ${chapterId}, slideOrder: ${slideOrder}, contentLength: ${slideContent.length}`);
    console.log(`[Course Creation] Document slide payload:`, {
        id: payload.id,
        title: payload.title,
        slide_order: payload.slide_order,
        status: payload.status,
        document_slide_type: payload.document_slide.type,
        document_slide_data_length: payload.document_slide.data?.length || 0,
        document_slide_has_published_data: !!payload.document_slide.published_data,
        document_slide_published_data_length: payload.document_slide.published_data?.length || 0,
    });
    
    const response = await authenticatedAxiosInstance.post(apiUrl, payload);
    console.log(`[Course Creation] Document slide API response:`, response.data);
    
    // Verify the response contains the slide ID
    const slideId = response.data?.id || response.data?.data?.id || response.data;
    if (!slideId) {
        console.warn(`[Course Creation] Warning: Document slide created but no ID returned in response`);
    } else {
        console.log(`[Course Creation] Document slide created with ID: ${slideId}`);
    }
}

/**
 * Creates a video slide
 */
async function createVideoSlide(params: CreateSlideParams): Promise<void> {
    const { slide, chapterId, moduleId, subjectId, packageSessionIds, instituteId, slideOrder } = params;

    // Extract video URL from content or use aiVideoData
    let videoUrl = '';
    let videoLength = 0;

    if (slide.slideType === 'ai-video' && slide.aiVideoData) {
        // For AI video, we need to use the video URL from aiVideoData
        videoUrl = slide.aiVideoData.videoId || '';
        videoLength = 0; // Will be set by backend
    } else if (slide.content) {
        // Try to extract YouTube URL from content
        const youtubeMatch = slide.content.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
        if (youtubeMatch) {
            videoUrl = `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
        }
    }

    const payload = {
        id: crypto.randomUUID(),
        title: slide.slideTitle,
        description: slide.content || '',
        url: videoUrl,
        video_length_in_millis: videoLength,
        published_url: videoUrl,
        published_video_length_in_millis: videoLength,
        source_type: slide.slideType === 'ai-video' ? 'AI_VIDEO' : 'YOUTUBE',
        embedded_type: slide.slideType === 'ai-video' ? 'AI_VIDEO' : 'YOUTUBE',
        embedded_data: slide.slideType === 'ai-video' && slide.aiVideoData ? JSON.stringify(slide.aiVideoData) : null,
        questions: [],
        slide_order: slideOrder,
        status: 'PUBLISHED', // Use PUBLISHED status so slides are visible
        new_slide: true,
    };

    const apiUrl = `${ADD_UPDATE_VIDEO_SLIDE}?chapterId=${chapterId}&instituteId=${instituteId}&packageSessionId=${packageSessionIds}&moduleId=${moduleId}&subjectId=${subjectId}`;
    console.log(`[Course Creation] Creating video slide API URL:`, apiUrl);
    console.log(`[Course Creation] Video slide - chapterId: ${chapterId}, slideOrder: ${slideOrder}, videoUrl: ${videoUrl}`);
    
    const response = await authenticatedAxiosInstance.post(apiUrl, payload);
    console.log(`[Course Creation] Video slide API response:`, response.data);
}

/**
 * Creates a quiz slide
 */
async function createQuizSlide(params: CreateSlideParams): Promise<void> {
    const { slide, chapterId, moduleId, subjectId, packageSessionIds, instituteId, slideOrder } = params;

    // Create quiz slide payload - use quiz_slide not question_slide
    const payload = {
        id: crypto.randomUUID(),
        title: slide.slideTitle,
        image_file_id: '',
        description: slide.content || '',
        status: 'PUBLISHED', // Use PUBLISHED status so slides are visible
        slide_order: slideOrder,
        quiz_slide: {
            id: crypto.randomUUID(),
            questions: [], // Empty questions array for now - questions can be added later
        },
        new_slide: true,
    };

    console.log(`[Course Creation] Creating quiz slide "${slide.slideTitle}" with payload:`, payload);

    const apiUrl = `${ADD_UPDATE_QUIZ_SLIDE}?chapterId=${chapterId}&instituteId=${instituteId}&packageSessionId=${packageSessionIds}&subjectId=${subjectId}&moduleId=${moduleId}`;
    console.log(`[Course Creation] Quiz slide API URL:`, apiUrl);
    
    const response = await authenticatedAxiosInstance.post(apiUrl, payload);
    console.log(`[Course Creation] Quiz slide API response:`, response.data);
}

/**
 * Creates a video+code slide (document slide with embedded video and code)
 */
async function createVideoCodeSlide(params: CreateSlideParams): Promise<void> {
    const { slide, chapterId, moduleId, subjectId, packageSessionIds, instituteId, slideOrder } = params;

    // Combine video and code content into a document
    // Get slide content - check multiple possible fields
    let combinedContent = slide.content || '';

    // If there's video data, add it to the content
    if (slide.slideType === 'ai-video-code' && slide.aiVideoData) {
        combinedContent += `\n\n[AI Video: ${slide.aiVideoData.videoId}]`;
    }

    console.log(`[Course Creation] Video-code slide content for "${slide.slideTitle}":`, {
        hasContent: !!combinedContent,
        contentLength: combinedContent?.length || 0,
        contentPreview: combinedContent?.substring(0, 100) || 'No content',
        slideType: slide.slideType,
    });

    const payload = {
        id: crypto.randomUUID(),
        title: slide.slideTitle,
        image_file_id: '',
        description: null,
        slide_order: slideOrder,
        document_slide: {
            id: crypto.randomUUID(),
            type: 'DOC', // Use 'DOC' instead of 'TEXT' to match existing codebase
            data: combinedContent,
            title: slide.slideTitle,
            cover_file_id: '',
            total_pages: 1,
            published_data: 'PUBLISHED' === 'PUBLISHED' ? combinedContent : null,
            published_document_total_pages: 1,
        },
        status: 'PUBLISHED', // Use PUBLISHED status so slides are visible
        new_slide: true,
        notify: false,
    };

    const apiUrl = `${ADD_UPDATE_DOCUMENT_SLIDE}?chapterId=${chapterId}&moduleId=${moduleId}&subjectId=${subjectId}&packageSessionId=${packageSessionIds}&instituteId=${instituteId}`;
    console.log(`[Course Creation] Creating video-code slide API URL:`, apiUrl);
    console.log(`[Course Creation] Video-code slide - chapterId: ${chapterId}, slideOrder: ${slideOrder}, contentLength: ${combinedContent.length}`);
    
    const response = await authenticatedAxiosInstance.post(apiUrl, payload);
    console.log(`[Course Creation] Video-code slide API response:`, response.data);
}
