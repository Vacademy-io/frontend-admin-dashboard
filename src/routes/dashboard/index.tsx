import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";
import { CreateAssessmentDashboardLogo, DashboardCreateCourse } from "@/svgs";
import { Badge } from "@/components/ui/badge";
import { CompletionStatusComponent } from "./-components/CompletionStatusComponent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useInstituteQuery } from "@/services/student-list-section/getInstituteDetails";
import { getInstituteDashboardData } from "./-services/dashboard-services";
import { DashboardLoader } from "@/components/core/dashboard-loader";

export const Route = createFileRoute("/dashboard/")({
    component: () => (
        <LayoutContainer>
            <DashboardComponent />
        </LayoutContainer>
    ),
});

export function DashboardComponent() {
    const { data: instituteDetails, isLoading: isInstituteLoading } =
        useSuspenseQuery(useInstituteQuery());
    const { data, isLoading: isDashboardLoading } = useSuspenseQuery(
        getInstituteDashboardData(instituteDetails?.id),
    );
    console.log(data);
    const navigate = useNavigate();
    const { setNavHeading } = useNavHeadingStore();

    const handleAssessmentTypeRoute = (type: string) => {
        navigate({
            to: "/assessment/create-assessment/$assessmentId/$examtype",
            params: {
                assessmentId: "defaultId",
                examtype: type,
            },
            search: {
                currentStep: 0,
            },
        });
    };

    const router = useRouter();

    const handleEnrollButtonClick = () => {
        router.navigate({
            to: `/students/students-list`,
        });
    };

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Dashboard</h1>);
    }, []);

    if (isInstituteLoading || isDashboardLoading) return <DashboardLoader />;
    return (
        <>
            <h1 className="text-2xl">
                Hello <span className="text-primary-500">{instituteDetails?.institute_name}!</span>
            </h1>
            <p className="mt-1 text-sm">
                Welcome aboard! We&apos;re excited to have you here. Let’s set up your admin
                dashboard and make learning seamless and engaging.
            </p>
            <iframe
                className="mt-6 size-full h-[80vh] rounded-xl"
                src="https://www.youtube.com/embed/FooC7gp4wk4"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
            <div className="mt-8 flex w-full flex-col gap-6">
                <Card className="grow bg-neutral-50 shadow-none">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Complete your institute profile</CardTitle>
                            <MyButton
                                type="submit"
                                scale="medium"
                                buttonType="secondary"
                                layoutVariant="default"
                                className="text-sm"
                            >
                                <Plus size={32} />
                                Add Details
                            </MyButton>
                        </div>
                        <CardDescription className="flex items-center gap-2">
                            <CompletionStatusComponent />
                            <span>{data.profile_completion_percentage}% complete</span>
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="flex gap-6">
                    <div className="flex flex-1 flex-col gap-6">
                        <Card className="bg-neutral-50 shadow-none">
                            <CardHeader className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Add users to various role types</CardTitle>
                                    <MyButton
                                        type="submit"
                                        scale="medium"
                                        buttonType="secondary"
                                        layoutVariant="default"
                                        className="text-sm"
                                    >
                                        <Plus size={32} />
                                        Add Users
                                    </MyButton>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#F4F9FF] py-1.5 font-thin shadow-none">
                                        Admin
                                    </Badge>
                                    <span className="font-thin text-primary-500">1</span>
                                    <Badge className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#F4FFF9] py-1.5 font-thin shadow-none">
                                        Educator
                                    </Badge>
                                    <span className="font-thin text-primary-500">0</span>
                                    <Badge className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#FFF4F5] py-1.5 font-thin shadow-none">
                                        Creator
                                    </Badge>
                                    <span className="font-thin text-primary-500">0</span>
                                    <Badge className="whitespace-nowrap rounded-lg border border-neutral-300 bg-[#F5F0FF] py-1.5 font-thin shadow-none">
                                        Evaluator
                                    </Badge>
                                    <span className="font-thin text-primary-500">0</span>
                                </div>
                            </CardHeader>
                        </Card>
                        <Card className="bg-neutral-50 shadow-none">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Create your first course</CardTitle>
                                    <MyButton
                                        type="submit"
                                        scale="medium"
                                        buttonType="secondary"
                                        layoutVariant="default"
                                        className="text-sm"
                                    >
                                        <Plus size={32} />
                                        Create
                                    </MyButton>
                                </div>
                                <CardDescription className="flex justify-center">
                                    <DashboardCreateCourse />
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                    <div className="flex flex-1 flex-col gap-6">
                        <Card className="grow bg-neutral-50 shadow-none">
                            <CardHeader className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle>Enroll students in institute batches</CardTitle>
                                    <MyButton
                                        type="submit"
                                        scale="medium"
                                        buttonType="secondary"
                                        layoutVariant="default"
                                        className="text-sm"
                                        onClick={handleEnrollButtonClick}
                                    >
                                        Enroll
                                    </MyButton>
                                </div>
                                <CardDescription className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span>Batches</span>
                                        <span className="text-primary-500">{data.batch_count}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Students</span>
                                        <span className="text-primary-500">
                                            {data.student_count}
                                        </span>
                                    </div>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                        <Card className="grow bg-neutral-50 shadow-none">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Create your first assessment</CardTitle>
                                    <Dialog>
                                        <DialogTrigger>
                                            <MyButton
                                                type="submit"
                                                scale="medium"
                                                buttonType="secondary"
                                                layoutVariant="default"
                                                className="text-sm"
                                            >
                                                <Plus size={32} />
                                                Create
                                            </MyButton>
                                        </DialogTrigger>
                                        <DialogContent className="p-0">
                                            <h1 className="rounded-lg bg-primary-50 p-4 text-primary-500">
                                                Create Assessment
                                            </h1>
                                            <div className="flex flex-col items-center justify-center gap-6">
                                                <MyButton
                                                    type="button"
                                                    scale="large"
                                                    buttonType="secondary"
                                                    className="mt-2 font-medium"
                                                    onClick={() =>
                                                        handleAssessmentTypeRoute("EXAM")
                                                    }
                                                >
                                                    Examination
                                                </MyButton>
                                                <MyButton
                                                    type="button"
                                                    scale="large"
                                                    buttonType="secondary"
                                                    className="font-medium"
                                                    onClick={() =>
                                                        handleAssessmentTypeRoute("MOCK")
                                                    }
                                                >
                                                    Mock
                                                </MyButton>
                                                <MyButton
                                                    type="button"
                                                    scale="large"
                                                    buttonType="secondary"
                                                    className="font-medium"
                                                    onClick={() =>
                                                        handleAssessmentTypeRoute("PRACTICE")
                                                    }
                                                >
                                                    Practice
                                                </MyButton>
                                                <MyButton
                                                    type="button"
                                                    scale="large"
                                                    buttonType="secondary"
                                                    className="mb-6 font-medium"
                                                    onClick={() =>
                                                        handleAssessmentTypeRoute("SURVEY")
                                                    }
                                                >
                                                    Survey
                                                </MyButton>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <CardDescription className="mt-2 flex items-center justify-center">
                                    <CreateAssessmentDashboardLogo className="mt-4" />
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
