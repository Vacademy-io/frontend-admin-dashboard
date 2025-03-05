// level-field.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { ControllerRenderProps } from "react-hook-form";
import { Level, CourseFormData } from "./add-course-form";

interface LevelFieldProps {
    field: ControllerRenderProps<CourseFormData, "levels">;
    level: Level;
}

export const LevelField = ({ field, level }: LevelFieldProps) => {
    return (
        <div className="flex items-center gap-3">
            <Checkbox
                className="invisible size-0 data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                checked={
                    ((field.value || []).find((l) => l.id === level.id)?.sessions?.length ?? 0) > 0
                }
                onCheckedChange={(checked) => {
                    const levels = [...(field.value || [])];

                    if (!checked) {
                        field.onChange(levels.filter((l) => l.id !== level.id));
                    } else {
                        // Add level with duration when checked
                        const newLevel = {
                            ...level,
                            new_level: level.id === "",
                            duration_in_days: level.duration_in_days || null,
                            sessions: [],
                        };
                        field.onChange([...levels, newLevel]);
                    }
                }}
            />
            <div className="flex flex-col">
                <div className="flex flex-col items-start">
                    <p className="text-subtitle font-semibold"> {level.level_name}</p>
                    <p className="text-caption text-neutral-400">
                        Days: {level.duration_in_days || 0}
                    </p>
                </div>

                {level.duration_in_days && (
                    <span className="text-xs text-neutral-500">
                        Duration: {level.duration_in_days} days
                    </span>
                )}
            </div>
        </div>
    );
};
