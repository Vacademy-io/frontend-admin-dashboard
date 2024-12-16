// bulk-actions.tsx
import { MyButton } from "@/components/design-system/button";
import { CaretUpDown, XCircle } from "@phosphor-icons/react";

interface BulkActionsProps {
    selectedCount: number;
}

export const BulkActions = ({ selectedCount }: BulkActionsProps) => {
    return (
        <div className="flex items-center gap-5 text-neutral-600">
            <div className="flex gap-1">
                [{selectedCount}] <div>Selected</div>
            </div>

            {selectedCount ? (
                <div className="flex items-center gap-3">
                    <MyButton
                        buttonType="secondary"
                        scale="medium"
                        layoutVariant="default"
                        className="flex items-center"
                        onClick={() => {}}
                    >
                        Reset
                        <XCircle />
                    </MyButton>

                    <MyButton
                        buttonType="primary"
                        scale="medium"
                        layoutVariant="default"
                        className="flex w-full cursor-pointer items-center justify-between"
                        onClick={() => {}}
                    >
                        <div>Student Name</div>
                        <div>
                            <CaretUpDown />
                        </div>
                    </MyButton>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
