import {
    BatchDetails,
    LearnerChoiceCourse,
    LearnerChoiceSession,
    LevelField,
    PreSelectedCourse,
    PreSelectedSession,
} from "../../-schema/InviteFormSchema";

export const ShowLevelDetails = ({ level }: { level: LevelField }) => {
    return <p>{level.name}</p>;
};

export const ShowPreSelectedSessionDetails = ({
    session,
    showSessionName = true,
}: {
    session: PreSelectedSession;
    showSessionName?: boolean;
}) => {
    return (
        <div className="flex flex-col gap-2">
            {showSessionName && <p>{session.name}</p>}
            <div className="flex justify-between gap-2">
                {session.preSelectedLevels.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">Compulsory Levels</p>
                        {session.preSelectedLevels?.map((preSelectedLevel, key) => (
                            <ShowLevelDetails key={key} level={preSelectedLevel} />
                        ))}
                    </div>
                )}
                {session.learnerChoiceLevels.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">
                            Student Choice Levels (Selection limit: {session.maxLevels})
                        </p>
                        {session.learnerChoiceLevels?.map((learnerChoiceLevels, key) => (
                            <ShowLevelDetails key={key} level={learnerChoiceLevels} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ShowLearnerChoiceSessionDetails = ({
    session,
    showSessionName = true,
}: {
    session: LearnerChoiceSession;
    showSessionName?: boolean;
}) => {
    return (
        <div className="flex flex-col gap-2">
            {showSessionName && <p>{session.name}</p>}
            {session.learnerChoiceLevels.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="font-semibold">
                        Student Choice Levels (Selection limit: {session.maxLevels})
                    </p>
                    {session.learnerChoiceLevels?.map((learnerChoiceLevels, key) => (
                        <ShowLevelDetails key={key} level={learnerChoiceLevels} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const ShowPreSelectedCoursesDetails = ({ course }: { course: PreSelectedCourse }) => {
    return (
        <div className="flex flex-col gap-2">
            <p>{course.name}</p>
            <div className="flex justify-between gap-2">
                {course.preSelectedSessions.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">Compulsory Sessions</p>
                        {course.preSelectedSessions?.map((preSelectedSession, key) => (
                            <ShowPreSelectedSessionDetails session={preSelectedSession} key={key} />
                        ))}
                    </div>
                )}
                {course.learnerChoiceSessions.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">
                            Student Choice Sessions (Selection limit: {course.maxSessions})
                        </p>
                        {course.learnerChoiceSessions?.map((learnerChoiceSession, key) => (
                            <ShowLearnerChoiceSessionDetails
                                key={key}
                                session={learnerChoiceSession}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export const ShowLearnerChoiceCourseDetails = ({ course }: { course: LearnerChoiceCourse }) => {
    return (
        <div className="flex flex-col gap-2">
            <p>{course.name}</p>
            <div className="flex justify-between gap-2">
                {course.learnerChoiceSessions.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold">
                            Student Choice Sessions (Selection limit: {course.maxSessions})
                        </p>
                        {course.learnerChoiceSessions?.map((learnerChoiceSession, key) => (
                            <ShowLearnerChoiceSessionDetails
                                key={key}
                                session={learnerChoiceSession}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export const ShowSelectedBatchDetails = ({ batch }: { batch: BatchDetails }) => {
    return (
        <div className="flex justify-between gap-2">
            {batch.preSelectedCourses.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="font-semibold">Compulsory Course</p>
                    {batch.preSelectedCourses.map((course, key) => (
                        <ShowPreSelectedCoursesDetails course={course} key={key} />
                    ))}
                </div>
            )}
            {batch.learnerChoiceCourses.length > 0 && (
                <div className="flex flex-col gap-1">
                    <p className="font-semibold">
                        Learner Choice Courses (Selection limit: {batch.maxCourses})
                    </p>
                    {batch.learnerChoiceCourses.map((course, key) => (
                        <ShowLearnerChoiceCourseDetails course={course} key={key} />
                    ))}
                </div>
            )}
        </div>
    );
};
