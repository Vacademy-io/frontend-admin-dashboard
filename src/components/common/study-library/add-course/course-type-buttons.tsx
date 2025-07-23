import { AddCourseForm } from './add-course-form';
import { MyButton } from '@/components/design-system/button';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { PencilSimpleLine, StarFour, Lightning } from 'phosphor-react';
import { BrainCircuit } from 'lucide-react';

const CourseTypeButtons = () => {
    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Section Heading */}
            <h2 className="text-center text-lg font-semibold text-neutral-700">
                Choose Creation Method
            </h2>

            {/* Cards */}
            <div className="flex flex-col gap-4">
                {/* Manual Creation Card */}
                <Card className="flex flex-col justify-between border-neutral-300 shadow-sm">
                    <CardHeader className="space-y-3">
                        <div className="text-primary-600 flex items-center gap-2">
                            <PencilSimpleLine size={22} />
                            <CardTitle className="text-base font-semibold">
                                Create Manually
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Build your course step-by-step with full control over content and
                            structure.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-start">
                        {/* Re-use the existing AddCourseForm which renders the trigger button */}
                        <AddCourseForm />
                    </CardFooter>
                </Card>

                {/* AI Creation Card */}
                <Card className="flex flex-col justify-between border-primary-300 bg-primary-50/30 shadow-sm">
                    <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between">
                            {/* Left: Brain icon + Title */}
                            <div className="text-primary-600 flex items-center gap-2">
                                <BrainCircuit size={20} />
                                <CardTitle className="text-primary-600 text-base font-semibold">
                                    Create with AI
                                </CardTitle>
                            </div>

                            {/* Right: AI Powered Badge with icons */}
                            <span className="ml-auto flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-400 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white">
                                <StarFour size={14} weight="fill" className="animate-spin" />
                                AI Powered
                                <Lightning size={14} weight="fill" className="animate-pulse" />
                            </span>
                        </div>
                        <CardDescription>
                            Generate a complete course structure and content using AI. Just provide
                            your requirements and let AI do the work.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="justify-start">
                        <MyButton
                            type="button"
                            scale="large"
                            buttonType="primary"
                            className="w-full font-medium"
                        >
                            Create Course Through AI
                        </MyButton>
                    </CardFooter>
                </Card>
            </div>
            {/* <div className="flex flex-col items-center justify-center gap-4 p-4">
                <AddCourseForm />
                <MyButton
                    type="button"
                    scale="large"
                    buttonType="secondary"
                    className="font-medium"
                >
                    Create {getTerminology(ContentTerms.Course, SystemTerms.Course)} Through AI
                </MyButton>
            </div> */}
        </div>
    );
};

export default CourseTypeButtons;
