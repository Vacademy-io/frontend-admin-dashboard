import { MyButton } from "@/components/design-system/button";
import { MyFilterOption } from "@/types/my-filter";

interface ScheduleTestFilterButtonsProps {
    selectedQuestionPaperFilters: Record<string, MyFilterOption[]>;
    handleSubmitFilters: () => void;
    handleResetFilters: () => void;
}

const ScheduleTestFilterButtons = ({
    selectedQuestionPaperFilters,
    handleSubmitFilters,
    handleResetFilters,
}: ScheduleTestFilterButtonsProps) => {
    const isButtonEnabled = () => {
        const {
            name,
            batch_ids,
            subjects_ids,
            tag_ids,
            assessment_statuses,
            assessment_modes,
            access_statuses,
        } = selectedQuestionPaperFilters;

        return (
            name.trim() !== "" ||
            batch_ids?.length > 0 ||
            subjects_ids?.length > 0 ||
            tag_ids?.length > 0 ||
            assessment_statuses?.length > 0 ||
            assessment_modes?.length > 0 ||
            access_statuses?.length > 0
        );
    };
    return (
        <>
            {!!isButtonEnabled() && (
                <div className="flex gap-6">
                    <MyButton
                        buttonType="primary"
                        scale="small"
                        layoutVariant="default"
                        className="h-8"
                        onClick={handleSubmitFilters}
                    >
                        Filter
                    </MyButton>
                    <MyButton
                        buttonType="secondary"
                        scale="small"
                        layoutVariant="default"
                        className="h-8 border border-neutral-400 bg-neutral-200 hover:border-neutral-500 hover:bg-neutral-300 active:border-neutral-600 active:bg-neutral-400"
                        onClick={handleResetFilters}
                    >
                        Reset
                    </MyButton>
                </div>
            )}
        </>
    );
};

export default ScheduleTestFilterButtons;
