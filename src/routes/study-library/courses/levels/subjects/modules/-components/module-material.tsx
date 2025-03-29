import { useEffect, useState } from "react";
import { AddModulesButton } from "./add-modules.tsx/add-modules-button";
import { Modules } from "./add-modules.tsx/modules";
import { Module } from "@/stores/study-library/use-modules-with-chapters-store";
import { useRouter } from "@tanstack/react-router";
// import { SearchInput } from "@/components/common/students/students-list/student-list-section/search-input";
import { useModulesWithChaptersStore } from "@/stores/study-library/use-modules-with-chapters-store";
import { useAddModule } from "@/routes/study-library/courses/levels/subjects/modules/-services/add-module";
import { useUpdateModule } from "@/routes/study-library/courses/levels/subjects/modules/-services/update-module";
import { useDeleteModule } from "@/routes/study-library/courses/levels/subjects/modules/-services/delete-module";
import { getLevelName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getLevelNameById";
import { getSubjectName } from "@/utils/helpers/study-library-helpers.ts/get-name-by-id/getSubjectNameById";
import { useUpdateModuleOrder } from "@/routes/study-library/courses/levels/subjects/modules/-services/update-modules-order";
import { orderModulePayloadType } from "@/routes/study-library/courses/-types/order-payload";
import { SessionDropdown } from "../../../../../../../components/common/study-library/study-library-session-dropdown";
import { getSubjectSessions } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSessionsForModules";
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store";
import { StudyLibrarySessionType } from "@/stores/study-library/use-study-library-store";
import useIntroJsTour from "@/hooks/use-intro";
import { StudyLibraryIntroKey } from "@/constants/storage/introKey";
import { studyLibrarySteps } from "@/constants/intro/steps";

export const ModuleMaterial = () => {
    const router = useRouter();
    const { modulesWithChaptersData } = useModulesWithChaptersStore();
    const { selectedSession, setSelectedSession } = useSelectedSessionStore();

    const addModuleMutation = useAddModule();
    const updateModuleMutation = useUpdateModule();
    const deleteModuleMutation = useDeleteModule();
    const updateModuleOrderMutation = useUpdateModuleOrder();

    // const [searchInput, setSearchInput] = useState("");

    const { courseId, subjectId, levelId } = router.state.location.search;
    const sessionList = subjectId ? getSubjectSessions(subjectId) : [];
    const initialSession =
        selectedSession && sessionList.includes(selectedSession) ? selectedSession : sessionList[0];
    // const initialSession = sessionList[0];
    const [currentSession, setCurrentSession] = useState(initialSession);

    const handleSessionChange = (value: string | StudyLibrarySessionType) => {
        if (typeof value !== "string" && value) {
            setCurrentSession(value);
        }
    };

    useIntroJsTour({
        key: StudyLibraryIntroKey.addModulesStep,
        steps: studyLibrarySteps.addModulesStep,
    });

    useEffect(() => {
        setSelectedSession(currentSession);
    }, [currentSession]);

    // Ensure courseId, subjectId, and levelId exist before proceeding
    if (!courseId) return <>Course Not found</>;
    if (!subjectId) return <>Subject Not found</>;
    if (!levelId) return <>Level Not found</>;

    const subject = getSubjectName(subjectId);
    const levelName = getLevelName(levelId);

    // const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setSearchInput(e.target.value);
    // };

    const handleAddModule = (module: Module) => {
        addModuleMutation.mutate({ subjectId, module });
    };

    const handleDeleteModule = (module: Module) => {
        deleteModuleMutation.mutate(module.id);
    };

    const handleEditModule = (updatedModule: Module) => {
        updateModuleMutation.mutate({ moduleId: updatedModule.id, module: updatedModule });
    };

    const handleUpdateModuleOrder = (orderPayload: orderModulePayloadType[]) => {
        updateModuleOrderMutation.mutate({
            updatedModules: orderPayload,
        });
    };

    const isLoading =
        addModuleMutation.isPending ||
        deleteModuleMutation.isPending ||
        updateModuleMutation.isPending;

    return (
        <div className="flex size-full flex-col gap-8 text-neutral-600">
            <div className="flex items-center justify-between gap-8">
                <div className="flex w-full flex-col gap-2">
                    <div className="text-h3 font-semibold">Manage Your Modules</div>
                    <div className="text-subtitle">
                        Explore and manage modules for {levelName} {subject}. Click on a module to
                        view and organize chapters, eBooks, and video lectures, or add new resources
                        to expand your study materials.
                    </div>
                </div>
                <AddModulesButton onAddModule={handleAddModule} />
            </div>
            <div className="flex items-center gap-6">
                <SessionDropdown
                    currentSession={currentSession ?? undefined}
                    onSessionChange={handleSessionChange}
                    className="text-title font-semibold"
                    sessionList={sessionList}
                />
                {/* TODO: add search fuctinality when api is ready
                    <SearchInput
                    searchInput={searchInput}
                    onSearchChange={handleSearchInputChange}
                    placeholder="Search module"
                /> */}
            </div>
            <Modules
                modules={modulesWithChaptersData}
                onDeleteModule={handleDeleteModule}
                onEditModule={handleEditModule}
                subjectId={subjectId}
                isLoading={isLoading}
                onOrderChange={handleUpdateModuleOrder}
            />
        </div>
    );
};
