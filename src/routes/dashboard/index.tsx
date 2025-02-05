import { createFileRoute } from "@tanstack/react-router";
import { LayoutContainer } from "@/components/common/layout-container/layout-container";
import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore";
import { useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";
import { DashboardCreateCourse } from "@/svgs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/")({
    component: () => (
        <LayoutContainer>
            <DashboardComponent />
        </LayoutContainer>
    ),
});

export function DashboardComponent() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading(<h1 className="text-lg">Dashboard</h1>);
    }, []);
    return (
        <>
            <h1 className="text-2xl">
                Hello <span className="text-primary-500">Aditya!</span>
            </h1>
            <p className="mt-1 text-sm">
                Welcome aboard! We&apos;re excited to have you here. Let’s set up your admin
                dashboard and make learning seamless and engaging.
            </p>
            <video controls className="mt-6 w-full rounded-lg">
                <source src="https://www.youtube.com/watch?v=FooC7gp4wk4" type="video/mp4" />
            </video>
            <div className="mt-8 flex w-full gap-6">
                <div className="flex w-1/2 flex-col gap-6">
                    <Card className="bg-neutral-50 shadow-none">
                        <CardHeader>
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
                <div className="flex w-1/2 flex-col gap-6">
                    <Card className="bg-neutral-50 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Complete your profile</CardTitle>
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
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-neutral-50 shadow-none">
                        <CardHeader>
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
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-neutral-50 shadow-none">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Complete your profile</CardTitle>
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
                            <CardDescription>Card Description</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </>
    );
}
