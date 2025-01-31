import { MyCheckbox } from "./add-chapter-form";

interface BatchCheckboxGroupProps {
    classLevel: string;
    batches: string[];
    selectedBatches: string[];
    onChange: (batches: string[]) => void;
}

export const BatchCheckboxGroup = ({
    classLevel,
    batches,
    selectedBatches,
    onChange,
}: BatchCheckboxGroupProps) => {
    const handleMainCheckboxChange = (checked: boolean) => {
        if (checked) {
            onChange(batches);
        } else {
            onChange([]);
        }
    };

    const handleBatchCheckboxChange = (batch: string, checked: boolean) => {
        if (checked) {
            onChange([...selectedBatches, batch]);
        } else {
            onChange(selectedBatches.filter((b) => b !== batch));
        }
    };

    const isMainChecked =
        batches.length > 0 && batches.every((batch) => selectedBatches.includes(batch));
    const isIndeterminate = selectedBatches.length > 0 && !isMainChecked;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <MyCheckbox
                    checked={isMainChecked}
                    indeterminate={isIndeterminate}
                    onCheckedChange={handleMainCheckboxChange}
                />
                <span className="font-semibold">{classLevel}</span>
            </div>
            <div className="ml-6 flex flex-col gap-2">
                {batches.map((batch, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <MyCheckbox
                            checked={selectedBatches.includes(batch)}
                            onCheckedChange={(checked) => handleBatchCheckboxChange(batch, checked)}
                        />
                        <span>{batch}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
