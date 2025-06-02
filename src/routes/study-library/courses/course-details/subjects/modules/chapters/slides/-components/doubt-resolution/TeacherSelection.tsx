import MultiSelectDropdown from '@/components/common/multi-select-dropdown';
import { useTeacherList } from '@/routes/dashboard/-hooks/useTeacherList';
import { getInstituteId } from '@/constants/helper';
import { useEffect, useState, useCallback } from 'react';
import { DoubtType } from '../../-types/add-doubt-type';
import { FacultyFilterParams } from '@/routes/dashboard/-services/dashboard-services';
import { useAddReply } from '../../-services/AddReply';
import { handleAddReply } from '../../-helper/handleAddReply';
import { useContentStore } from '../../-stores/chapter-sidebar-store';

// Custom debounce hook
const useDebounce = <T extends (...args: unknown[]) => void>(callback: T, delay: number) => {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            const newTimeoutId = setTimeout(() => {
                callback(...args);
            }, delay);

            setTimeoutId(newTimeoutId);
        },
        [callback, delay]
    );
};

export const TeacherSelection = ({
    doubt,
    filters,
    refetch,
}: {
    doubt: DoubtType;
    filters: FacultyFilterParams;
    refetch: () => void;
}) => {
    const addReply = useAddReply();
    const InstituteId = getInstituteId();
    const { activeItem } = useContentStore();
    const { data: TeachersList } = useTeacherList(InstituteId || '', 0, 100, filters, true);
    const teacherOptions =
        TeachersList?.content?.map(
            (teacher) =>
                ({ id: teacher.id, name: teacher.name }) as { id: string | number; name: string }
        ) || [];
    const [selectedTeachers, setSelectedTeachers] = useState<
        { id: string | number; name: string }[]
    >(
        doubt.doubt_assignee_request_user_ids
            ?.map((id) => teacherOptions.find((teacher) => teacher.id === id))
            ?.filter(
                (teacher): teacher is { id: string | number; name: string } => teacher !== undefined
            )
    );

    const handleTeacherSelection = (selectedTeachers: { id: string | number; name: string }[]) => {
        setSelectedTeachers(selectedTeachers);
    };

    const submitReply = useCallback(async () => {
        const replyData: DoubtType = {
            id: doubt.id,
            user_id: doubt.user_id,
            name: doubt.name,
            source: doubt.source,
            source_id: doubt.source_id,
            raised_time: doubt.raised_time,
            resolved_time: doubt.resolved_time,
            content_position: doubt.content_position,
            content_type: doubt.content_type,
            html_text: doubt.html_text,
            status: doubt.status,
            parent_id: doubt.parent_id,
            parent_level: doubt.parent_level,
            doubt_assignee_request_user_ids: doubt.doubt_assignee_request_user_ids,
            all_doubt_assignee: selectedTeachers?.map((teacher) => {
                return {
                    id: String(teacher.id),
                    source_id: activeItem?.id || '',
                    source: 'SLIDE',
                    status: 'ACTIVE',
                };
            }),
            delete_assignee_request: doubt.delete_assignee_request,
        };
        await handleAddReply({ replyData, addReply, refetch, id: doubt.id });
    }, [doubt, selectedTeachers, activeItem?.id, addReply, refetch]);

    const debouncedSubmitReply = useDebounce(submitReply, 6000); // 60 seconds debounce

    useEffect(() => {
        if (selectedTeachers?.length > 0) {
            debouncedSubmitReply();
        }
    }, [selectedTeachers]);

    return (
        <div className="flex flex-col gap-2">
            <p className="font-semibold ">Assigned to:</p>
            <MultiSelectDropdown
                options={teacherOptions}
                selected={selectedTeachers}
                onChange={handleTeacherSelection}
                placeholder="+ Assign"
            />
        </div>
    );
};
