// session-field.tsx
import { MyButton } from "@/components/design-system/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DotsThree } from "@phosphor-icons/react";
import { Session, Level, CourseFormData } from "./add-course-form";
import { ControllerRenderProps } from "react-hook-form";

interface SessionFieldProps {
    session: Session;
    field: ControllerRenderProps<CourseFormData, "levels">;
    level: Level;
}

export const SessionField = ({ session, field, level }: SessionFieldProps) => {
    return (
        <div key={session.id} className="flex items-center gap-3 rounded-md p-2">
            <Checkbox
                className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                checked={
                    ((field.value || []).find((l) => l.id === level.id)?.sessions || []).some(
                        (s) => s.id === session.id,
                    ) ?? false
                }
                onCheckedChange={(checked) => {
                    const levels = [...(field.value || [])];
                    const levelIndex = levels.findIndex((l) => l.id === level.id);

                    if (levelIndex === -1 && checked) {
                        levels.push({
                            ...level,
                            new_level: level.id === "",
                            sessions: [
                                {
                                    ...session,
                                    new_session: session.id === "",
                                    start_date: session.start_date, // Include start_date
                                },
                            ],
                        });
                    } else if (levelIndex !== -1 && levels[levelIndex]) {
                        const currentLevel = levels[levelIndex];
                        if (currentLevel) {
                            const currentSessions = currentLevel.sessions || [];
                            currentLevel.sessions = checked
                                ? [
                                      ...currentSessions,
                                      {
                                          ...session,
                                          new_session: session.id === "",
                                          start_date: session.start_date, // Include start_date
                                      },
                                  ]
                                : currentSessions.filter((s) => s.id !== session.id);
                            currentLevel.new_level = currentLevel.id === "";
                        }
                    }

                    field.onChange(levels);
                }}
            />
            <div className="flex w-full items-center justify-between">
                <div className="flex flex-col">
                    <div className="flex flex-col items-start">
                        <p className="text-subtitle font-semibold"> {session.session_name}</p>
                        <p className="text-caption text-neutral-400">
                            Start Date: {session.start_date}
                        </p>
                    </div>
                    {session.start_date && (
                        <span className="text-xs text-neutral-500">
                            Starts: {new Date(session.start_date).toLocaleDateString()}
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
