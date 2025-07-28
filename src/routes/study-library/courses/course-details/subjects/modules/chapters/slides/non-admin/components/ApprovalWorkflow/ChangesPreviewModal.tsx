import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Plus, FileText, Spinner } from 'phosphor-react';
import { useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { fetchStudyLibraryDetails } from '@/routes/study-library/courses/-services/getStudyLibraryDetails';
import { DashboardLoader } from '@/components/core/dashboard-loader';

interface ChangesPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onSubmitForApproval: () => void;
    isSubmitting: boolean;
}

interface ChangesSummary {
    isNewCourse: boolean;
    originalCourseId: string | null;
    changesDetected: {
        newSlides: number;
        updatedSlides: number;
        totalSlides: number;
        newChapters: number;
        newModules: number;
        newSubjects: number;
    };
}

export function ChangesPreviewModal({
    isOpen,
    onClose,
    courseId,
    onSubmitForApproval,
    isSubmitting,
}: ChangesPreviewModalProps) {
    const { studyLibraryData } = useStudyLibraryStore();
    const [changesSummary, setChangesSummary] = useState<ChangesSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch changes data when modal opens
    useEffect(() => {
        if (isOpen && courseId) {
            fetchChangesData();
        }
    }, [isOpen, courseId]);

    const fetchChangesData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Find current course data
            const currentCourse = studyLibraryData?.find(
                (item) => item.course.id === courseId
            );

            if (!currentCourse) {
                throw new Error('Course not found');
            }

            const originalCourseId = currentCourse.course.originalCourseId || null;
            const isNewCourse = !originalCourseId;

            if (isNewCourse) {
                // For new courses, show all content as new
                const summary = await calculateNewCourseChanges(currentCourse);
                setChangesSummary({
                    isNewCourse: true,
                    originalCourseId: null,
                    changesDetected: summary,
                });
            } else {
                // For course updates, compare with original
                const summary = await compareWithOriginalCourse(courseId, originalCourseId);
                setChangesSummary({
                    isNewCourse: false,
                    originalCourseId,
                    changesDetected: summary,
                });
            }
        } catch (err) {
            console.error('Error fetching changes data:', err);
            setError('Failed to load changes data');
        } finally {
            setLoading(false);
        }
    };

    const calculateNewCourseChanges = async (courseData: any) => {
        // Count all content as new for new courses
        let totalSlides = 0;
        let totalChapters = 0;
        let totalModules = 0;
        let totalSubjects = 0;

        courseData.sessions?.forEach((session: any) => {
            session.level_with_details?.forEach((level: any) => {
                totalSubjects += level.subjects?.length || 0;
                // Note: We'd need to access modules and chapters data from the modules store
                // For now, we'll provide a basic count
            });
        });

        return {
            newSlides: totalSlides, // This would need access to slides data
            updatedSlides: 0,
            totalSlides: totalSlides,
            newChapters: totalChapters,
            newModules: totalModules,
            newSubjects: totalSubjects,
        };
    };

    const compareWithOriginalCourse = async (currentCourseId: string, originalCourseId: string) => {
        try {
            // Fetch original course data
            const originalData = await fetchStudyLibraryDetails();
            const originalCourse = originalData?.find(
                (item: any) => item.course.id === originalCourseId
            );

            if (!originalCourse) {
                throw new Error('Original course not found');
            }

            // For now, return basic comparison
            // In a real implementation, you'd compare the course structures
            return {
                newSlides: 0, // This would require detailed comparison
                updatedSlides: 0,
                totalSlides: 0,
                newChapters: 0,
                newModules: 0,
                newSubjects: 0,
            };
        } catch (error) {
            console.error('Error comparing with original course:', error);
            throw error;
        }
    };

    const handleSubmit = () => {
        onSubmitForApproval();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        Review Changes Before Submission
                    </DialogTitle>
                    <DialogDescription>
                        Review the changes you've made before submitting this course for approval.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <DashboardLoader size={24} />
                            <span className="ml-3 text-sm text-gray-600">Analyzing changes...</span>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <X size={16} />
                                <span className="font-medium">Error</span>
                            </div>
                            <p className="mt-1 text-sm text-red-700">{error}</p>
                        </div>
                    ) : changesSummary ? (
                        <div className="space-y-4">
                            {/* Course Type Badge */}
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={changesSummary.isNewCourse ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {changesSummary.isNewCourse ? 'New Course' : 'Course Update'}
                                </Badge>
                                {!changesSummary.isNewCourse && (
                                    <span className="text-xs text-gray-500">
                                        Based on original course: {changesSummary.originalCourseId}
                                    </span>
                                )}
                            </div>

                            {/* Changes Summary */}
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Changes Summary</h4>

                                {changesSummary.isNewCourse ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Plus size={14} className="text-green-600" />
                                            <span>New course with all content</span>
                                        </div>
                                        <div className="ml-6 space-y-1 text-xs text-gray-600">
                                            <div>• {changesSummary.changesDetected.newSubjects} subjects</div>
                                            <div>• {changesSummary.changesDetected.newModules} modules</div>
                                            <div>• {changesSummary.changesDetected.newChapters} chapters</div>
                                            <div>• {changesSummary.changesDetected.totalSlides} slides</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {changesSummary.changesDetected.newSlides > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Plus size={14} className="text-green-600" />
                                                <span>{changesSummary.changesDetected.newSlides} new slides</span>
                                            </div>
                                        )}
                                        {changesSummary.changesDetected.updatedSlides > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <FileText size={14} className="text-blue-600" />
                                                <span>{changesSummary.changesDetected.updatedSlides} updated slides</span>
                                            </div>
                                        )}
                                        {changesSummary.changesDetected.newSubjects > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Plus size={14} className="text-green-600" />
                                                <span>{changesSummary.changesDetected.newSubjects} new subjects</span>
                                            </div>
                                        )}
                                        {changesSummary.changesDetected.newModules > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Plus size={14} className="text-green-600" />
                                                <span>{changesSummary.changesDetected.newModules} new modules</span>
                                            </div>
                                        )}
                                        {changesSummary.changesDetected.newChapters > 0 && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Plus size={14} className="text-green-600" />
                                                <span>{changesSummary.changesDetected.newChapters} new chapters</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Next Steps */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                                <ul className="space-y-1 text-sm text-blue-800">
                                    <li>• Your course will be submitted for admin review</li>
                                    <li>• You'll receive notifications about the review status</li>
                                    <li>• You can track progress in "Courses In Review"</li>
                                    <li>• You can withdraw and make changes if needed</li>
                                </ul>
                            </div>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="gap-2">
                    <MyButton
                        buttonType="secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </MyButton>
                    <MyButton
                        buttonType="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || loading || !!error}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner size={16} className="mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} className="mr-2" />
                                Submit for Approval
                            </>
                        )}
                    </MyButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
