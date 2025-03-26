import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectionMode } from "../../../-schema/InviteFormSchema";

interface BatchSelectionFieldProps {
    title: string;
    isPreSelectionDisabled: boolean;
    bothEnabled?: boolean;
    mode: SelectionMode;
    onChangeMode: (mode: SelectionMode) => void;
}

export const BatchSelectionField = ({
    title,
    isPreSelectionDisabled,
    bothEnabled = false,
    mode,
    onChangeMode,
}: BatchSelectionFieldProps) => {
    return (
        <div className={`flex flex-col gap-4`}>
            <div className="flex items-center gap-6">
                <p className="text-subtitle font-semibold">{title} Selection Mode</p>
                <RadioGroup
                    className="flex items-center gap-6"
                    value={mode}
                    onValueChange={(value: SelectionMode) => {
                        onChangeMode(value);
                    }}
                    // disabled={isDisabled}
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem
                            value="institute"
                            id="institute"
                            disabled={isPreSelectionDisabled}
                        />
                        <label
                            htmlFor={`${title}-institute`}
                            className={isPreSelectionDisabled ? "text-neutral-400" : ""}
                        >
                            Institute assigns
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="student" id="student" />
                        <label htmlFor={`${title}-student`}>Student chooses</label>
                    </div>
                    {bothEnabled && (
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="both" id="both" />
                            <label htmlFor={`${title}-student`}>Both</label>
                        </div>
                    )}
                </RadioGroup>
            </div>
        </div>
    );
};
