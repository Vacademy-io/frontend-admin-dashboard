import MultiSelectDropdown from '@/components/common/multi-select-dropdown';
import { useTeacherList } from '@/routes/dashboard/-hooks/useTeacherList';
import { getInstituteId } from '@/constants/helper';
import { useEffect, useState, useCallback, useMemo } from 'react';
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
    canChange,
    showCanAssign
}: {
    doubt: DoubtType;
    filters: FacultyFilterParams;
    canChange: boolean;
    showCanAssign?: boolean;
}) => {
    const addReply = useAddReply();
    const InstituteId = getInstituteId();
    const { activeItem } = useContentStore();
    const { data: TeachersList } = useTeacherList(InstituteId || '', 0, 100, filters, true);

    const teacherOptions = useMemo(
        () =>
            TeachersList?.content?.map(
                (teacher) =>
                    ({ id: teacher.id, name: teacher.name }) as {
                        id: string | number;
                        name: string;
                    }
            ) || [],
        [TeachersList?.content]
    );

    const [selectedTeachers, setSelectedTeachers] = useState<
        { id: string | number; name: string }[]
    >(
        teacherOptions?.filter((teacher) =>
            doubt?.all_doubt_assignee?.some((assignee) => assignee.source_id === teacher.id)
        )
    );

    useEffect(() => {
        setSelectedTeachers(
            teacherOptions?.filter((teacher) =>
                doubt?.all_doubt_assignee?.some((assignee) => assignee.source_id === teacher.id)
            )
        );
    }, [teacherOptions, doubt?.all_doubt_assignee]);

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
            doubt_assignee_request_user_ids: selectedTeachers
                ?.filter(
                    (teacher) =>
                        !doubt.all_doubt_assignee.some(
                            (assignee) => assignee.source_id === teacher.id
                        )
                )
                .map((teacher) => String(teacher.id)),
            all_doubt_assignee: doubt.all_doubt_assignee,
            delete_assignee_request: doubt.all_doubt_assignee
                .filter(
                    (assignee) =>
                        !selectedTeachers.some((teacher) => teacher.id === assignee.source_id)
                )
                .map((assignee) => assignee.id),
        };
        await handleAddReply({ replyData, addReply, id: doubt.id });
    }, [doubt, selectedTeachers, activeItem?.id, addReply]);

    const debouncedSubmitReply = useDebounce(submitReply, 1000); // 60 seconds debounce

    useEffect(() => {
        if (selectedTeachers?.length > 0) {
            debouncedSubmitReply();
        }
    }, [selectedTeachers]);

    return (
        <div className="flex items-center gap-2">
            {(showCanAssign==undefined || showCanAssign==true) && <p className="font-semibold ">Assigned to:</p>}
            {canChange ? (
                <MultiSelectDropdown
                    options={teacherOptions}
                    selected={selectedTeachers}
                    onChange={handleTeacherSelection}
                    placeholder="+ Assign"
                />
            ) : (
                <div className="flex items-center gap-2">
                    <p className="rounded-md border border-neutral-300 p-1">
                        {selectedTeachers.map((teacher) => teacher.name).join(', ')}
                    </p>
                </div>
            )}
        </div>
    );
};
