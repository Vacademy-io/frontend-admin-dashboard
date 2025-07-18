type ApiCourseData = {
    course: {
        id: string;
        package_name: string;
    };
    sessions: {
        session_dto: {
            id: string;
            session_name: string;
        };
        level_with_details: {
            id: string;
            name: string;
        }[];
    }[];
};

export function transformApiDataToDummyStructure(data: ApiCourseData[]) {
    const dummyCourses: { id: string; name: string }[] = [];
    const dummyBatches: Record<
        string,
        {
            sessionId: string;
            sessionName: string;
            levels: {
                levelId: string;
                levelName: string;
            }[];
        }[]
    > = {};

    data.forEach((courseItem) => {
        const courseId = courseItem.course.id;
        const courseName = courseItem.course.package_name;

        // Add to dummyCourses
        dummyCourses.push({
            id: courseId,
            name: courseName,
        });

        // Prepare sessions for dummyBatches
        const sessions = courseItem.sessions.map((sessionItem) => ({
            sessionId: sessionItem.session_dto.id,
            sessionName: sessionItem.session_dto.session_name,
            levels: sessionItem.level_with_details.map((lvl) => ({
                levelId: lvl.id,
                levelName: lvl.name,
            })),
        }));

        dummyBatches[courseId] = sessions;
    });

    return { dummyCourses, dummyBatches };
}
