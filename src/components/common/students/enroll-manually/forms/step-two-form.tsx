import { FormStepHeading } from "../form-components/form-step-heading";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FormItemWrapper } from "../form-components/form-item-wrapper";
import { useForm } from "react-hook-form";
import { FormSubmitButtons } from "../form-components/form-submit-buttons";
import { MyInput } from "@/components/design-system/input";
import { MyDropdown } from "../dropdownForPackageItems";
import { useGetGenders } from "@/routes/students/students-list/-hooks/useFilters";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormStore } from "@/stores/students/enroll-students-manually/enroll-manually-form-store";
import {
    StepTwoData,
    stepTwoSchema,
} from "@/schemas/student/student-list/schema-enroll-students-manually";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useRef, useState } from "react";
import { DropdownItemType } from "../dropdownTypesForPackageItems";
import { StudentTable } from "@/types/student-table-types";
import { BatchForSessionType } from "@/schemas/student/student-list/institute-schema";

export const StepTwoForm = ({ initialValues }: { initialValues?: StudentTable }) => {
    const { stepTwoData, setStepTwoData, nextStep } = useFormStore();
    const genderList = useGetGenders();

    const {
        getCourseFromPackage,
        getSessionFromPackage,
        getLevelsFromPackage,
        getDetailsFromPackageSessionId,
    } = useInstituteDetailsStore();

    const [courseList, setCourseList] = useState<DropdownItemType[]>(getCourseFromPackage());
    const [sessionList, setSessionList] = useState<DropdownItemType[]>(getSessionFromPackage());
    const [levelList, setLevelList] = useState<DropdownItemType[]>(getLevelsFromPackage());

    const [initialBatch, setInitialBatch] = useState<BatchForSessionType | null>(null);

    useEffect(() => {
        if (initialValues) {
            const details = getDetailsFromPackageSessionId({
                packageSessionId: initialValues.package_session_id,
            });
            setInitialBatch(details);

            if (details) {
                form.reset({
                    fullName: initialValues?.full_name || "",
                    course: {
                        id: initialBatch?.package_dto.id || "",
                        name: initialBatch?.package_dto.package_name || "",
                    },
                    session: {
                        id: initialBatch?.session.id || "",
                        name: initialBatch?.session.session_name || "",
                    },
                    level: {
                        id: initialBatch?.level.id || "",
                        name: initialBatch?.level.level_name || "",
                    },
                    accessDays: initialValues?.session_expiry_days.toString() || "",
                    enrollmentNumber: initialValues?.institute_enrollment_id || "",
                    gender: initialValues?.gender || "",
                    collegeName: initialValues?.linked_institute_name || "",
                });
            }
        } else {
            setInitialBatch(null);
        }
    }, [initialValues]);

    // Track which field was most recently changed
    const lastChangedField = useRef<string | null>(null);

    const form = useForm<StepTwoData>({
        resolver: zodResolver(stepTwoSchema),
        defaultValues: stepTwoData || {
            fullName: initialValues?.full_name || "",
            course: {
                id: initialBatch?.package_dto.id || "",
                name: initialBatch?.package_dto.package_name || "",
            },
            session: {
                id: initialBatch?.session.id || "",
                name: initialBatch?.session.session_name || "",
            },
            level: {
                id: initialBatch?.level.id || "",
                name: initialBatch?.level.level_name || "",
            },
            accessDays: initialValues?.session_expiry_days.toString() || "",
            enrollmentNumber: initialValues?.institute_enrollment_id || "",
            gender: initialValues?.gender || "",
            collegeName: initialValues?.linked_institute_name || "",
        },
        mode: "onChange",
    });

    const onSubmit = (values: StepTwoData) => {
        setStepTwoData(values);
        nextStep();
    };

    // Custom onChange handlers to track which field changed
    // eslint-disable-next-line
    const handleCourseChange = (value: any) => {
        lastChangedField.current = "course";
        form.setValue("course", value);
    };

    // eslint-disable-next-line
    const handleSessionChange = (value: any) => {
        lastChangedField.current = "session";
        form.setValue("session", value);
    };

    // eslint-disable-next-line
    const handleLevelChange = (value: any) => {
        lastChangedField.current = "level";
        form.setValue("level", value);
    };

    // Get current values from form
    const courseValue = form.watch("course");
    const sessionValue = form.watch("session");
    const levelValue = form.watch("level");

    // When course changes, update session and level lists
    useEffect(() => {
        if (lastChangedField.current === "course" && courseValue.id) {
            // Update the sessions based on selected course
            setSessionList(
                getSessionFromPackage({
                    courseId: courseValue.id,
                }),
            );

            // Update the levels based on selected course
            setLevelList(
                getLevelsFromPackage({
                    courseId: courseValue.id,
                }),
            );

            // Reset the session and level selections if they're no longer valid
            const currentSession = form.getValues("session");
            const currentLevel = form.getValues("level");

            // Reset session if needed
            const validSessions = getSessionFromPackage({ courseId: courseValue.id });
            const sessionIsValid = validSessions.some((s) => s.id === currentSession.id);
            if (!sessionIsValid && currentSession.id) {
                form.setValue("session", { id: "", name: "" });
            }

            // Reset level if needed
            const validLevels = getLevelsFromPackage({ courseId: courseValue.id });
            const levelIsValid = validLevels.some((l) => l.id === currentLevel.id);
            if (!levelIsValid && currentLevel.id) {
                form.setValue("level", { id: "", name: "" });
            }
        }

        // Reset the change tracker after handling
        lastChangedField.current = null;
    }, [courseValue, getSessionFromPackage, getLevelsFromPackage]);

    // When session changes, update course and level lists
    useEffect(() => {
        if (lastChangedField.current === "session" && sessionValue.id) {
            // Update the courses based on selected session
            setCourseList(
                getCourseFromPackage({
                    sessionId: sessionValue.id,
                }),
            );

            // Update the levels based on selected session
            setLevelList(
                getLevelsFromPackage({
                    sessionId: sessionValue.id,
                }),
            );

            // Reset the course and level selections if they're no longer valid
            const currentCourse = form.getValues("course");
            const currentLevel = form.getValues("level");

            // Reset course if needed
            const validCourses = getCourseFromPackage({ sessionId: sessionValue.id });
            const courseIsValid = validCourses.some((c) => c.id === currentCourse.id);
            if (!courseIsValid && currentCourse.id) {
                form.setValue("course", { id: "", name: "" });
            }

            // Reset level if needed
            const validLevels = getLevelsFromPackage({ sessionId: sessionValue.id });
            const levelIsValid = validLevels.some((l) => l.id === currentLevel.id);
            if (!levelIsValid && currentLevel.id) {
                form.setValue("level", { id: "", name: "" });
            }
        }

        // Reset the change tracker after handling
        lastChangedField.current = null;
    }, [sessionValue, getCourseFromPackage, getLevelsFromPackage]);

    // When level changes, update course and session lists
    useEffect(() => {
        if (lastChangedField.current === "level" && levelValue.id) {
            // Update the courses based on selected level
            setCourseList(
                getCourseFromPackage({
                    levelId: levelValue.id,
                }),
            );

            // Update the sessions based on selected level
            setSessionList(
                getSessionFromPackage({
                    levelId: levelValue.id,
                }),
            );

            // Reset the course and session selections if they're no longer valid
            const currentCourse = form.getValues("course");
            const currentSession = form.getValues("session");

            // Reset course if needed
            const validCourses = getCourseFromPackage({ levelId: levelValue.id });
            const courseIsValid = validCourses.some((c) => c.id === currentCourse.id);
            if (!courseIsValid && currentCourse.id) {
                form.setValue("course", { id: "", name: "" });
            }

            // Reset session if needed
            const validSessions = getSessionFromPackage({ levelId: levelValue.id });
            const sessionIsValid = validSessions.some((s) => s.id === currentSession.id);
            if (!sessionIsValid && currentSession.id) {
                form.setValue("session", { id: "", name: "" });
            }
        }

        // Reset the change tracker after handling
        lastChangedField.current = null;
    }, [levelValue, getCourseFromPackage, getSessionFromPackage]);

    // Add this effect to auto-select single options
    useEffect(() => {
        // If there's exactly one session and nothing is selected yet
        if (sessionList.length === 1 && !sessionValue.id) {
            handleSessionChange(sessionList[0]);
        }

        // Similar logic for course and level if needed
        if (courseList.length === 1 && !courseValue.id) {
            handleCourseChange(courseList[0]);
        }

        if (levelList.length === 1 && !levelValue.id) {
            handleLevelChange(levelList[0]);
        }
    }, [sessionList, courseList, levelList]);

    return (
        <div>
            <div className="flex flex-col justify-center p-6 text-neutral-600">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                        <FormItemWrapper<StepTwoData> control={form.control} name="fullName">
                            <FormStepHeading stepNumber={2} heading="General Details" />
                        </FormItemWrapper>

                        <div className="flex flex-col gap-8">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Full Name"
                                                inputPlaceholder="Full name (First and Last)"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.fullName?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="course"
                                render={({ field: { value } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    Course
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value.name}
                                                    dropdownList={courseList}
                                                    handleChange={handleCourseChange}
                                                    placeholder="Select Course"
                                                    error={
                                                        form.formState.errors.course?.id?.message ||
                                                        form.formState.errors.course?.name?.message
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="session"
                                render={({ field: { value } }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    Session{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value.name}
                                                    dropdownList={sessionList}
                                                    handleChange={handleSessionChange}
                                                    placeholder="Select Session"
                                                    error={
                                                        form.formState.errors.session?.id
                                                            ?.message ||
                                                        form.formState.errors.session?.name?.message
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field: { value } }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    Level{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value.name}
                                                    dropdownList={levelList}
                                                    handleChange={handleLevelChange}
                                                    placeholder="Select Level"
                                                    error={
                                                        form.formState.errors.level?.id?.message ||
                                                        form.formState.errors.level?.name?.message
                                                    }
                                                    required={true}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accessDays"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="number" // Keep as "number" for input behavior
                                                label="Enter access days"
                                                inputPlaceholder="Eg. 365"
                                                input={value} // Display the string value
                                                onChangeFunction={(e) => {
                                                    // Convert to number for validation, floor it, then convert back to string
                                                    const numValue = Math.floor(
                                                        Number(e.target.value),
                                                    );
                                                    // Only update if it's a valid number
                                                    if (!isNaN(numValue)) {
                                                        onChange(String(numValue)); // Store as string in form
                                                    }
                                                }}
                                                error={form.formState.errors.accessDays?.message}
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                                step="1"
                                                min="1"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="enrollmentNumber"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="Enrollment Number"
                                                inputPlaceholder="VACAD090"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={
                                                    form.formState.errors.enrollmentNumber?.message
                                                }
                                                required={true}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field: { onChange, value } }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <div className="flex flex-col gap-1">
                                                <div>
                                                    Gender{" "}
                                                    <span className="text-subtitle text-danger-600">
                                                        *
                                                    </span>
                                                </div>
                                                <MyDropdown
                                                    currentValue={value}
                                                    dropdownList={genderList}
                                                    handleChange={onChange}
                                                    placeholder="Select Gender"
                                                    error={form.formState.errors.gender?.message}
                                                    required={true}
                                                />
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="collegeName"
                                render={({ field: { onChange, value, ...field } }) => (
                                    <FormItem>
                                        <FormControl>
                                            <MyInput
                                                inputType="text"
                                                label="College/School Name"
                                                inputPlaceholder="Enter Student's College/School Name"
                                                input={value}
                                                onChangeFunction={onChange}
                                                error={form.formState.errors.collegeName?.message}
                                                size="large"
                                                className="w-full"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                </Form>
            </div>
            <FormSubmitButtons stepNumber={2} onNext={form.handleSubmit(onSubmit)} />
        </div>
    );
};
