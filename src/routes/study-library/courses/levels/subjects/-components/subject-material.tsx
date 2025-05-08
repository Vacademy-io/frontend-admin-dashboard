// class-study-material.tsx
import { useRouter } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { AddSubjectButton } from './add-subject.tsx/add-subject-button';
import { Subjects } from './add-subject.tsx/subjects';
import { useEffect, useState } from 'react';
import { SubjectType, useStudyLibraryStore } from '@/stores/study-library/use-study-library-store';
import { useAddSubject } from '@/routes/study-library/courses/levels/subjects/-services/addSubject';
import { useUpdateSubject } from '@/routes/study-library/courses/levels/subjects/-services/updateSubject';
import { useDeleteSubject } from '@/routes/study-library/courses/levels/subjects/-services/deleteSubject';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { getCourseSubjects } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects';
import { useGetPackageSessionId } from '@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getPackageSessionId';
import { useUpdateSubjectOrder } from '@/routes/study-library/courses/levels/subjects/-services/updateSubjectOrder';
import { orderSubjectPayloadType } from '@/routes/study-library/courses/-types/order-payload';
import useIntroJsTour from '@/hooks/use-intro';
import { StudyLibraryIntroKey } from '@/constants/storage/introKey';
import { studyLibrarySteps } from '@/constants/intro/steps';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { tabs, TabType } from '../-constants/constant';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { fetchModulesWithChapters } from '../../../-services/getModulesWithChapters';
import { MyDropdown } from '@/components/common/students/enroll-manually/dropdownForPackageItems';
import { DropdownValueType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useInstituteDetailsStore } from '@/stores/students/students-list/useInstituteDetailsStore';
import { DropdownItemType } from '@/components/common/students/enroll-manually/dropdownTypesForPackageItems';
import { useAddModule } from '@/routes/study-library/courses/levels/subjects/modules/-services/add-module';
import { AddModulesButton } from '../modules/-components/add-modules.tsx/add-modules-button';
import { CaretDown } from 'phosphor-react';
// import { Module } from "@/stores/study-library/use-modules-with-chapters-store";

export interface Chapter {
  id: string;
  chapter_name: string;
  status: string;
  description: string;
  file_id: string | null;
  chapter_order: number;
}

export interface ChapterMetadata {
  chapter: Chapter;
  slides_count: {
    video_count: number;
    pdf_count: number;
    doc_count: number;
    unknown_count: number;
  };
  chapter_in_package_sessions: string[];
}

export interface Module {
  id: string;
  module_name: string;
  status: string;
  description: string;
  thumbnail_id: string;
}

export interface ModuleWithChapters {
  module: Module;
  chapters: ChapterMetadata[];
}

export type SubjectModulesMap = {
  [subjectId: string]: ModuleWithChapters[];
};

export const SubjectMaterial = () => {
  const router = useRouter();
  const searchParams = router.state.location.search;
  const { getSessionFromPackage } = useInstituteDetailsStore();
  const { studyLibraryData } = useStudyLibraryStore();

  // Extract params safely
  const courseId: string = searchParams.courseId || '';
  const levelId: string = searchParams.levelId || '';

  // Define states before any conditions
  const [sessionList, setSessionList] = useState<DropdownItemType[]>(
    searchParams.courseId ? getSessionFromPackage({ courseId: courseId, levelId: levelId }) : []
  );
  const initialSession: DropdownItemType | undefined = {
    id: sessionList[0]?.id || '',
    name: sessionList[0]?.name || '',
  };

  const [currentSession, setCurrentSession] = useState<DropdownItemType | undefined>(
    () => initialSession
  );

  useEffect(() => {
    setSessionList(
      searchParams.courseId
        ? getSessionFromPackage({ courseId: courseId, levelId: searchParams.levelId })
        : []
    );
  }, [searchParams.courseId, searchParams.levelId]);

  useEffect(() => {
    setCurrentSession({ id: sessionList[0]?.id || '', name: sessionList[0]?.name || '' });
  }, [sessionList]);

  const handleSessionChange = (value: DropdownValueType) => {
    if (value && typeof value === 'object' && 'id' in value && 'name' in value) {
      setCurrentSession(value as DropdownItemType);
    }
  };
  const [selectedTab, setSelectedTab] = useState('OUTLINE');
  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };
  const [subjectModulesMap, setSubjectModulesMap] = useState<SubjectModulesMap>({});

  const getTabClass = (isActive: boolean) =>
    `flex gap-1.5 rounded-none pb-2 pl-12 pr-12 pt-2 !shadow-none ${
      isActive
        ? 'border-4px rounded-tl-sm rounded-tr-sm border !border-b-0 border-primary-200 !bg-primary-50'
        : 'border-none bg-transparent'
    }`;
  // const [searchInput, setSearchInput] = useState("");

  // Custom hooks (always called unconditionally)
  const addModuleMutation = useAddModule();
  const addSubjectMutation = useAddSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const updateSubjectOrderMutation = useUpdateSubjectOrder();

  useIntroJsTour({
    key: StudyLibraryIntroKey.addSubjectStep,
    steps: studyLibrarySteps.addSubjectStep,
  });

  const initialSubjects = getCourseSubjects(courseId, currentSession?.id ?? '', levelId);
  const [subjects, setSubjects] = useState(initialSubjects);

  useEffect(() => {
    const newSubjects = getCourseSubjects(courseId, currentSession?.id ?? '', levelId);
    setSubjects(newSubjects);
  }, [currentSession, studyLibraryData]);
  const packageSessionIds =
    useGetPackageSessionId(courseId, currentSession?.id ?? '', levelId) || '';

  const useModulesMutation = () => {
    return useMutation({
      mutationFn: async ({
        subjects,
        packageSessionIds,
      }: {
        subjects: SubjectType[];
        packageSessionIds: string;
      }) => {
        const results = await Promise.all(
          subjects.map(async (subject) => {
            const res = await fetchModulesWithChapters(subject.id, packageSessionIds);
            return { subjectId: subject.id, modules: res };
          })
        );

        const modulesMap: SubjectModulesMap = {};
        results.forEach(({ subjectId, modules }) => {
          modulesMap[subjectId] = modules;
        });

        return modulesMap;
      },
    });
  };

  const { mutateAsync: fetchModules } = useModulesMutation();
  const handleAddModule = (subjectId: string, module: Module) => {
    addModuleMutation.mutate(
      { subjectId, module },
      {
        onSuccess: async () => {
          const updatedSubjects = getCourseSubjects(courseId, currentSession?.id ?? '', levelId);
          const updatedModulesMap = await fetchModules({
            subjects: updatedSubjects,
            packageSessionIds,
          });
          setSubjects(updatedSubjects);
          setSubjectModulesMap(updatedModulesMap);
        },
      }
    );
  };

  useEffect(() => {
    const loadModules = async () => {
      if (subjects.length > 0) {
        const modulesMap = await fetchModules({ subjects, packageSessionIds });
        setSubjectModulesMap(modulesMap);
      }
    };

    loadModules();
  }, [subjects, packageSessionIds]);

  // const classNumber = getLevelName(levelId);

  // const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //     setSearchInput(e.target.value);
  // };

  const handleAddSubject = async (newSubject: SubjectType) => {
    if (packageSessionIds.length === 0) {
      console.error('No package session IDs found');
      return;
    }

    addSubjectMutation.mutate({
      subject: newSubject,
      packageSessionIds,
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    deleteSubjectMutation.mutate(subjectId);
  };

  const handleEditSubject = (subjectId: string, updatedSubject: SubjectType) => {
    updateSubjectMutation.mutate({
      subjectId,
      updatedSubject,
    });
  };

  const handleSubjectOrderChange = (updatedOrder: orderSubjectPayloadType[]) => {
    updateSubjectOrderMutation.mutate({
      orderedSubjects: updatedOrder,
    });
  };

  const handleSubjectNavigation = (id: string) => {
    const currentPath = router.state.location.pathname;
    const searchParams = router.state.location.search;
    router.navigate({
      to: `${currentPath}/modules`,
      search: {
        courseId: searchParams.courseId,
        levelId: searchParams.levelId,
        subjectId: id,
        sessionId: currentSession?.id,
      },
    });
  };
  const handleModuleNavigation = (subjectId: string, id: string) => {
    const currentPath = router.state.location.pathname;
    const searchParams = router.state.location.search;
    router.navigate({
      to: `${currentPath}/modules/chapters`,
      search: {
        courseId: searchParams.courseId,
        levelId: searchParams.levelId,
        subjectId: subjectId,
        moduleId: id,
        sessionId: searchParams.sessionId,
      },
    });
  };

  const tabContent: Record<TabType, React.ReactNode> = {
    [TabType.OUTLINE]: (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <MyDropdown
            currentValue={currentSession ?? undefined}
            dropdownList={sessionList}
            placeholder="Select Session"
            handleChange={handleSessionChange}
          />
        </div>
        <div className="flex flex-col">
          {subjects.map((subject, idx) => (
            <Collapsible key={subject.id}>
              <CollapsibleTrigger
                className="flex flex-row items-center gap-2 font-bold"
                onDoubleClick={() => {
                  handleSubjectNavigation(subject.id);
                }}
              >
                <CaretDown size={16} />
                <div className="text-gray-400">S{idx + 1}</div>
                {subject.subject_name}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4">
                  {subjectModulesMap[subject.id]?.map((mod, idx) => (
                    <Collapsible key={mod.module.id}>
                      <CollapsibleTrigger
                        onDoubleClick={() => {
                          handleModuleNavigation(subject.id, mod.module.id);
                        }}
                        className="flex flex-row items-center gap-2 font-medium"
                      >
                        <CaretDown size={16} />
                        <div className="text-gray-400">M{idx + 1}</div>
                        {mod.module.module_name}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="">
                        {mod.chapters.map((ch, idx) => (
                          <div
                            key={ch.chapter.id}
                            className="ml-8 flex flex-row items-center gap-2"
                          >
                            <div className="text-gray-400">C{idx + 1}</div>
                            <div className="">{ch.chapter.chapter_name}</div>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                  <AddModulesButton
                    isTextButton
                    subjectId={subject.id}
                    onAddModuleBySubjectId={handleAddModule}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
          <AddSubjectButton isTextButton onAddSubject={handleAddSubject} />
        </div>
      </div>
    ),
    [TabType.SUBJECTS]: (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-8">
          <div className="flex w-full flex-col gap-2">
            <div className="text-h3 font-semibold">{`Manage Batch Subjects`}</div>
            <div className="text-subtitle">
              Explore and manage resources for the batch. Click on a subject to view and organize
              eBooks and video lectures, or upload new content to enrich your learning centre.
            </div>
          </div>
          <AddSubjectButton onAddSubject={handleAddSubject} />
        </div>
        <div className="flex items-center gap-6">
          <MyDropdown
            currentValue={currentSession ?? undefined}
            dropdownList={sessionList}
            placeholder="Select Session"
            handleChange={handleSessionChange}
          />
        </div>
        <Subjects
          subjects={subjects}
          onDeleteSubject={handleDeleteSubject}
          onEditSubject={handleEditSubject}
          packageSessionIds={packageSessionIds}
          onOrderChange={handleSubjectOrderChange}
        />
      </div>
    ),
    [TabType.STUDENT]: <div>student content</div>,
    [TabType.TEACHERS]: <div>teachers content</div>,
    [TabType.ASSESSMENT]: <div>assessment content</div>,
    [TabType.ASSIGNMENT]: <div>assignment content</div>,
    [TabType.GRADING]: <div>grading content</div>,
    [TabType.ANNOUNCEMENT]: <div>announcement content</div>,
  };

  if (courseId == '' || levelId == '') {
    return <p>Missing required parameters</p>;
  }

  // const courseName = getCourseNameById(courseId);

  const isLoading =
    addSubjectMutation.isPending ||
    deleteSubjectMutation.isPending ||
    updateSubjectMutation.isPending;

  return isLoading ? (
    <DashboardLoader />
  ) : (
    <div className="flex size-full flex-col gap-8 text-neutral-600">
      <Tabs value={selectedTab} onValueChange={handleTabChange}>
        <div className="flex flex-row justify-between">
          <TabsList className="hide-scrollbar inline-flex h-auto justify-start gap-4 overflow-y-auto rounded-none border-b !bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={getTabClass(selectedTab === tab.value)}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {tabContent[tab.value as TabType]}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
