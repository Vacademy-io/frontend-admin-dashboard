// bulk-actions.tsx
import { MyButton } from "@/components/design-system/button";
import { CaretUpDown, XCircle } from "@phosphor-icons/react";
import { BulkActionsMenu } from "./bulk-actions-menu";

interface BulkActionsProps {
    selectedCount: number;
    selectedStudentIds: string[];
    onReset: () => void;
}

export const BulkActions = ({ selectedCount, onReset, selectedStudentIds }: BulkActionsProps) => {
    return (
        <div className="flex items-center gap-5 text-neutral-600">
            <div className="flex gap-1">
                [{selectedCount}] <div>Selected</div>
            </div>

            {selectedCount > 0 && (
                <div className="flex items-center gap-3">
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="default"
                        className="flex items-center"
                        onClick={onReset}
                    >
                        Reset
                        <XCircle />
                    </MyButton>

                    <BulkActionsMenu
                        selectedCount={selectedCount}
                        selectedStudentIds={selectedStudentIds}
                        trigger={
                            <MyButton
                                buttonType="primary"
                                scale="medium"
                                layoutVariant="default"
                                className="flex w-full cursor-pointer items-center justify-between"
                            >
                                <div>Bulk Actions</div>
                                <CaretUpDown />
                            </MyButton>
                        }
                    />
                </div>
            )}
        </div>
    );
};
