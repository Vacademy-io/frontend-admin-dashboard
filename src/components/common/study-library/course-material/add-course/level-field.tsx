// level-field.tsx (renamed to level-in-session-field.tsx)
import { MyButton } from "@/components/design-system/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DotsThree } from "@phosphor-icons/react";
import { Level, Session, CourseFormData } from "./add-course-form";
import { ControllerRenderProps } from "react-hook-form";

interface LevelInSessionFieldProps {
    level: Level;
    session: Session;
    field: ControllerRenderProps<CourseFormData, "sessions">;
}

export const LevelInSessionField = ({ level, session, field }: LevelInSessionFieldProps) => {
    return (
        <div key={level.id} className="flex items-center gap-3 rounded-md p-2">
            <Checkbox
                className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                checked={
                    ((field.value || []).find((s) => s.id === session.id)?.levels || []).some(
                        (l) => l.id === level.id,
                    ) ?? false
                }
                onCheckedChange={(checked) => {
                    const sessions = [...(field.value || [])];
                    const sessionIndex = sessions.findIndex((s) => s.id === session.id);

                    if (sessionIndex === -1 && checked) {
                        // If this session doesn't exist in our form value yet, add it with this level
                        sessions.push({
                            ...session,
                            new_session: session.id === "",
                            levels: [
                                {
                                    ...level,
                                    new_level: level.id === "",
                                },
                            ],
                        });
                    } else if (sessionIndex !== -1 && sessions[sessionIndex]) {
                        // If this session exists, update its levels
                        const currentSession = sessions[sessionIndex];
                        if (currentSession) {
                            const currentLevels = currentSession.levels || [];
                            currentSession.levels = checked
                                ? [
                                      ...currentLevels,
                                      {
                                          ...level,
                                          new_level: level.id === "",
                                      },
                                  ]
                                : currentLevels.filter((l) => l.id !== level.id);
                        }
                    }

                    field.onChange(sessions);
                }}
            />
            <div className="flex w-full items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex flex-col items-start">
                        <p className="text-subtitle font-semibold">{level.level_name}</p>
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
                <MyButton buttonType="secondary" layoutVariant="icon" scale="small">
                    <DotsThree />
                </MyButton>
            </div>
        </div>
    );
};
