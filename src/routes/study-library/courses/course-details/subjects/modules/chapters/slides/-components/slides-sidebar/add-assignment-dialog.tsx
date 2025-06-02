import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { useContentStore } from '../../-stores/chapter-sidebar-store';
import { Route } from '../..';
import { useSlides } from '../../-hooks/use-slides';
import { DashboardLoader } from '@/components/core/dashboard-loader';

const AddAssignmentDialog = ({
    openState,
}: {
    openState?: ((open: boolean) => void) | undefined;
}) => {
    const { setActiveItem, getSlideById } = useContentStore();
    const { chapterId } = Route.useSearch();
    const { updateAssignmentOrder } = useSlides(chapterId);
    const [title, setTitle] = useState('');
    const [isAssignmentAdding, setIsAssignmentAdding] = useState(false);

    const handleAddAssignment = async (title: string | undefined) => {
        setIsAssignmentAdding(true);
        try {
            const response: string = await updateAssignmentOrder({
                id: crypto.randomUUID(),
                source_id: '',
                source_type: 'ASSIGNMENT',
                title: title || '',
                image_file_id: '',
                description: '',
                status: 'DRAFT',
                slide_order: 0,
                assignment_slide: {
                    id: crypto.randomUUID(),
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    parent_rich_text: {
                        id: null,
                        type: '',
                        content: '',
                    },
                    text_data: {
                        id: null,
                        type: '',
                        content: '',
                    },
                    live_date: '',
                    end_date: '',
                    re_attempt_count: 0,
                    comma_separated_media_ids: '',
                },
                is_loaded: true,
                new_slide: true,
            });

            toast.success('Assignment added successfully!');
            openState?.(false);
            setActiveItem(getSlideById(response));
        } catch (error) {
            toast.error('Failed to add assignment');
        } finally {
            setIsAssignmentAdding(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <MyInput
                input={title}
                onChangeFunction={(e) => setTitle(e.target.value)}
                label="Title"
                required={true}
                inputType="text"
                inputPlaceholder="Add Title"
                className="w-full"
            />
            <div>
                {isAssignmentAdding ? (
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="font-medium"
                    >
                        <DashboardLoader size={18} color="#ffffff" />
                    </MyButton>
                ) : (
                    <MyButton
                        type="button"
                        scale="large"
                        buttonType="primary"
                        className="font-medium"
                        onClick={() => handleAddAssignment(title)}
                        disable={!title}
                    >
                        Add
                    </MyButton>
                )}
            </div>
        </div>
    );
};

export default AddAssignmentDialog;
