import { MyButton } from "@/components/design-system/button";
import { MyInput } from "@/components/design-system/input";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { Plus, DotsThree } from "@phosphor-icons/react";
import { AddLevelInput } from "@/components/design-system/add-level-input";
import { AddCourseButton } from "../../../course-material/add-course-button";
import { AddCourseData } from "../../../course-material/add-course/add-course-form";
import { toast } from "sonner";
import { useAddCourse } from "@/services/study-library/course-operations/add-course";
import { Checkbox } from "@/components/ui/checkbox";
import { LevelType } from "@/schemas/student/student-list/institute-schema";

const formSchema = z.object({
    id: z.string().nullable(),
    session_name: z.string(),
    status: z.string(),
    start_date: z.string(),
    new_session: z.boolean(),
    levels: z.array(
        z.object({
            id: z.string().nullable(),
            new_level: z.boolean(),
            level_name: z.string(),
            duration_in_days: z.number().nullable(),
            thumbnail_file_id: z.string().nullable(),
            package_id: z.string(),
        }),
    ),
});
export type LevelForSession = z.infer<typeof formSchema>["levels"][number];
export type AddSessionDataType = z.infer<typeof formSchema>;

export const AddSessionForm = ({
    initialValues,
    onSubmit,
}: {
    initialValues?: AddSessionDataType;
    onSubmit: (sessionData: AddSessionDataType) => void;
}) => {
    const { instituteDetails, getPackageWiseLevels } = useInstituteDetailsStore();

    const [packageWithLevels, setPackageWithLevels] = useState(getPackageWiseLevels());
    const [newLevelName, setNewLevelName] = useState("");
    const [newLevelDuration, setNewLevelDuration] = useState<number | null>(null);
    const addCourseMutation = useAddCourse();
    const [locallyAddedLevels, setLocallyAddedLevels] = useState<Record<string, LevelType[]>>({});
    const [disableAddButton, setDisableAddButton] = useState(true);

    useEffect(() => {
        // When refreshing packageWithLevels, combine existing levels with locally added ones
        const packages = getPackageWiseLevels();

        // For each package, add only its own locally added levels
        const updatedPackages = packages.map((pkg) => {
            const packageId = pkg.package_dto.id;
            const levelsToAdd = locallyAddedLevels[packageId] || [];

            return {
                ...pkg,
                levels: [...pkg.levels, ...levelsToAdd],
            };
        });

        setPackageWithLevels(updatedPackages);
    }, [instituteDetails, locallyAddedLevels]);

    const form = useForm<AddSessionDataType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: initialValues?.id || null,
            session_name: initialValues?.session_name || "",
            status: initialValues?.status || "ACTIVE",
            start_date: initialValues?.start_date || new Date().toISOString(),
            new_session: initialValues ? false : true,
            levels: initialValues?.levels || [],
        },
    });

    // Add this useEffect to handle the disabled state of the Add button
    useEffect(() => {
        const sessionName = form.watch("session_name");
        const startDate = form.watch("start_date");
        const levels = form.watch("levels");

        const hasValidName = sessionName.trim() !== "";
        const hasValidDate = startDate !== "";
        const hasSelectedLevels = levels.length > 0;

        setDisableAddButton(!(hasValidName && hasValidDate && hasSelectedLevels));
    }, [form.watch("session_name"), form.watch("start_date"), form.watch("levels")]);

    const handleAddLevel = (
        levelName: string,
        durationInDays: number | null,
        packageId: string,
    ) => {
        // Create the new level object
        const newLevel: LevelForSession = {
            id: "", // Use the temp ID instead of null
            new_level: true,
            level_name: levelName,
            duration_in_days: durationInDays,
            thumbnail_file_id: null,
            package_id: packageId,
        };

        // Check if this level name already exists for this package to avoid duplicates
        const currentLevels = form.getValues("levels");
        const levelNameExists = currentLevels.some(
            (level) => level.level_name === levelName && level.package_id === packageId,
        );

        if (!levelNameExists) {
            // Add to form values only if it doesn't exist
            form.setValue("levels", [...currentLevels, newLevel]);

            // Add to local state for THIS package only with the same ID
            const levelForPackage: LevelType = {
                id: "",
                level_name: levelName,
                duration_in_days: durationInDays,
                thumbnail_id: null,
            };

            setLocallyAddedLevels((prev) => ({
                ...prev,
                [packageId]: [...(prev[packageId] || []), levelForPackage],
            }));
        }

        // Reset inputs
        setNewLevelName("");
        setNewLevelDuration(null);
    };

    const handleSelectLevel = (level: LevelType, packageId: string, isSelected: boolean) => {
        const currentLevels = form.getValues("levels");

        if (isSelected) {
            // Remove the level if it's already selected
            const updatedLevels = currentLevels.filter(
                (l) => !(l.id === level.id && l.package_id === packageId),
            );
            form.setValue("levels", updatedLevels);
        } else {
            // Add the level if it's not already selected
            const levelToAdd: LevelForSession = {
                id: level.id,
                new_level: false,
                level_name: level.level_name,
                duration_in_days: level.duration_in_days,
                thumbnail_file_id: level.thumbnail_id,
                package_id: packageId,
            };
            form.setValue("levels", [...currentLevels, levelToAdd]);
        }
    };

    const isLevelSelected = (levelId: string, packageId: string) => {
        return form
            .getValues("levels")
            .some((level) => level.id === levelId && level.package_id === packageId);
    };

    // Add this function to check if a package has any selected levels
    const hasSelectedLevelsInPackage = (packageId: string) => {
        return form.getValues("levels").some((level) => level.package_id === packageId);
    };

    const handleAddCourse = ({ requestData }: { requestData: AddCourseData }) => {
        addCourseMutation.mutate(
            { requestData: requestData },
            {
                onSuccess: () => {
                    toast.success("Course added successfully");
                },
                onError: (error) => {
                    toast.error(error.message || "Failed to add course");
                },
            },
        );
    };

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex max-h-[80vh] flex-col gap-8 overflow-y-auto p-2 text-neutral-600"
            >
                <FormField
                    control={form.control}
                    name="session_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Session Name"
                                    required={true}
                                    inputType="text"
                                    inputPlaceholder="Eg. 2024-2025"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <MyInput
                                    label="Start Date"
                                    required={true}
                                    inputType="date"
                                    inputPlaceholder="DD/MM/YYYY"
                                    className="w-full"
                                    input={field.value}
                                    onChangeFunction={(e) => field.onChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="mb-14 flex flex-col gap-4">
                    <p className="text-body text-neutral-500">Select levels from courses</p>
                    <FormField
                        control={form.control}
                        name="levels"
                        render={() => (
                            <FormItem className="w-full">
                                <FormControl>
                                    <div className="flex flex-col gap-4">
                                        {packageWithLevels.map((packageItem) => {
                                            const packageHasSelectedLevels =
                                                hasSelectedLevelsInPackage(
                                                    packageItem.package_dto.id,
                                                );
                                            return (
                                                <div
                                                    key={packageItem.package_dto.id}
                                                    className={`rounded-lg border border-neutral-200 py-2 ${
                                                        packageHasSelectedLevels
                                                            ? "bg-neutral-100"
                                                            : ""
                                                    }`}
                                                >
                                                    <div className="flex w-full items-center justify-between p-4 pr-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <div className="flex flex-col items-start">
                                                                    <p className="text-subtitle font-semibold">
                                                                        {
                                                                            packageItem.package_dto
                                                                                .package_name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MyButton
                                                                buttonType="secondary"
                                                                layoutVariant="icon"
                                                                scale="small"
                                                                type="button"
                                                            >
                                                                <DotsThree />
                                                            </MyButton>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 mr-6 mt-2">
                                                        <Separator />
                                                        <div className="grid grid-cols-2">
                                                            {packageItem.levels.map((level) => {
                                                                const selected = isLevelSelected(
                                                                    level.id,
                                                                    packageItem.package_dto.id,
                                                                );
                                                                return (
                                                                    <div
                                                                        key={level.id}
                                                                        className="flex cursor-pointer items-center gap-2 rounded-md p-2"
                                                                    >
                                                                        <Checkbox
                                                                            className="data-[state=checked]:bg-primary-500 data-[state=checked]:text-white"
                                                                            checked={selected}
                                                                            onCheckedChange={() =>
                                                                                handleSelectLevel(
                                                                                    level,
                                                                                    packageItem
                                                                                        .package_dto
                                                                                        .id,
                                                                                    selected,
                                                                                )
                                                                            }
                                                                        />
                                                                        <span>
                                                                            {level.level_name}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                            {!initialValues && (
                                                                <div className="mt-2">
                                                                    <AddLevelInput
                                                                        newLevelName={newLevelName}
                                                                        setNewLevelName={
                                                                            setNewLevelName
                                                                        }
                                                                        newLevelDuration={
                                                                            newLevelDuration
                                                                        }
                                                                        setNewLevelDuration={
                                                                            setNewLevelDuration
                                                                        }
                                                                        handleAddLevel={(
                                                                            name,
                                                                            duration,
                                                                        ) =>
                                                                            handleAddLevel(
                                                                                name,
                                                                                duration,
                                                                                packageItem
                                                                                    .package_dto.id,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {!initialValues && (
                                            <AddCourseButton
                                                onSubmit={handleAddCourse}
                                                courseButton={
                                                    <MyButton
                                                        buttonType="text"
                                                        layoutVariant="default"
                                                        scale="small"
                                                        className="w-fit text-primary-500 hover:bg-white active:bg-white"
                                                    >
                                                        <Plus /> Add Course
                                                    </MyButton>
                                                }
                                            />
                                        )}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="absolute bottom-0 mt-4 flex w-[640px] items-center justify-end bg-white py-3 pr-10">
                    <MyButton
                        type="submit"
                        buttonType="primary"
                        layoutVariant="default"
                        scale="large"
                        className="w-[140px]"
                        disable={disableAddButton}
                    >
                        Add
                    </MyButton>
                </div>
            </form>
        </FormProvider>
    );
};
