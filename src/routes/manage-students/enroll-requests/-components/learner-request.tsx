import { useEffect, useState } from 'react';
import { ContentType } from '../-types/enroll-request-types';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { BatchForSessionType } from '@/schemas/student/student-list/institute-schema';
import { RequestCard } from './requestCard';

interface SelectedLevelType {
    id: string;
    package_session_id: string;
}

interface SelectedSessionsType {
    session_id: string;
    selected_levels: SelectedLevelType[];
}

interface BatchOptionItemType {
    package_id: string;
    selected_sessions: SelectedSessionsType[];
}

// The response is an array, not a single object
type BatchOptionsType = BatchOptionItemType[];

export const LearnerRequest = ({ obj }: { obj: ContentType }) => {
    const { getDetailsFromPackageSessionId, getPackageSessionId } = useInstituteDetailsStore();
    const [selectedBatches, setSelectedBatches] = useState<BatchForSessionType[]>([]);

    useEffect(() => {
        try {
            // Reset selected batches to avoid duplications
            setSelectedBatches([]);

            // Parse JSON response - it's an array of batch options
            const batchJsonArray: BatchOptionsType = JSON.parse(
                obj.learner_invitation_response_dto.batch_selection_response_json
            );

            if (!Array.isArray(batchJsonArray)) {
                console.error('Expected array but got:', typeof batchJsonArray);
                return;
            }

            // Process each item in the array
            batchJsonArray.forEach((batchItem) => {
                if (batchItem.selected_sessions && Array.isArray(batchItem.selected_sessions)) {
                    // Process each session in the current batch item
                    batchItem.selected_sessions.forEach((session) => {
                        const sessionId = session.session_id;

                        if (session.selected_levels && Array.isArray(session.selected_levels)) {
                            // Process each level in the current session
                            session.selected_levels.forEach((level) => {
                                const pkgId = getPackageSessionId({
                                    courseId: batchItem.package_id,
                                    sessionId: sessionId,
                                    levelId: level.id,
                                });

                                if (pkgId) {
                                    const selectedBatch = getDetailsFromPackageSessionId({
                                        packageSessionId: pkgId,
                                    });

                                    if (selectedBatch) {
                                        setSelectedBatches((prevBatches) => [
                                            ...prevBatches,
                                            selectedBatch,
                                        ]);
                                    }
                                }
                            });
                        } else {
                            console.warn(
                                'No selected levels or not an array:',
                                session.selected_levels
                            );
                        }
                    });
                } else {
                    console.warn(
                        'No selected sessions or not an array:',
                        batchItem.selected_sessions
                    );
                }
            });
        } catch (error) {
            console.error('Error processing batch selection JSON:', error);
        }
    }, [obj, getDetailsFromPackageSessionId, getPackageSessionId]);

    // Handle empty state
    if (selectedBatches.length === 0) {
        return (
            <div className="p-4 text-neutral-600">
                <RequestCard obj={obj} />
            </div>
        );
    }

    // Return the list of request cards
    return (
        <>
            {selectedBatches.map((selectedBatch, index) => (
                <RequestCard key={index} obj={obj} batchDetails={selectedBatch} />
            ))}
        </>
    );
};
