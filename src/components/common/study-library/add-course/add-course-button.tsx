import { MyButton } from '@/components/design-system/button';
import { MyDialog } from '@/components/design-system/dialog';
import { useState } from 'react';
import { AddCourseForm } from './add-course-form';
import { ContentTerms, SystemTerms } from '@/routes/settings/-components/NamingSettings';
import { getTerminology } from '../../layout-container/sidebar/utils';
import { useNavigate } from '@tanstack/react-router';
import { Sparkles, PenTool, ChevronRight, Rocket, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AddCourseButton = () => {
    const [openSelectionDialog, setOpenSelectionDialog] = useState(false);
    const [openManualDialog, setOpenManualDialog] = useState(false);
    const navigate = useNavigate();

    const handleSelectionOpenChange = (open: boolean) => {
        setOpenSelectionDialog(open);
    };

    const handleManualOpenChange = (open: boolean) => {
        setOpenManualDialog(open);
        if (!open) {
            setOpenSelectionDialog(false);
        }
    };

    const handleManualCreation = () => {
        setOpenSelectionDialog(false);
        setOpenManualDialog(true);
    };

    const handleAICreation = () => {
        setOpenSelectionDialog(false);
        navigate({ to: '/study-library/ai-copilot' });
    };

    const courseTerm = getTerminology(ContentTerms.Course, SystemTerms.Course);

    return (
        <>
            {/* Selection Dialog */}
            <MyDialog
                trigger={
                    <MyButton type="button" scale="large" buttonType="primary" className="font-medium">
                        Create {courseTerm}
                    </MyButton>
                }
                heading=" "
                dialogWidth="max-w-2xl"
                open={openSelectionDialog}
                onOpenChange={handleSelectionOpenChange}
                className="rounded-3xl [&>div:first-child]:hidden [&>div:nth-child(2)]:p-0"
            >
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative flex flex-col p-6"
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={() => setOpenSelectionDialog(false)}
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        aria-label="Close dialog"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Custom Header */}
                    <div className="mb-6 text-center">
                        <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                            How would you like to create your {courseTerm.toLowerCase()}?
                        </h2>
                        <p className="text-sm text-gray-500">
                            Choose a creation method that best fits your workflow.
                        </p>
                    </div>

                    {/* Option Cards */}
                    <div className="space-y-4">
                        {/* Manual Creation Option */}
                        <motion.button
                            type="button"
                            onClick={handleManualCreation}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleManualCreation();
                                }
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'group flex w-full items-start gap-5 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-300',
                                'hover:border-primary-400 hover:bg-indigo-50 hover:shadow-md',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                            )}
                        >
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                                <Rocket className="h-7 w-7 text-primary-600" />
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="mb-1.5 text-lg font-semibold text-gray-900">
                                        Create Manually
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Build your {courseTerm.toLowerCase()} step by step with complete
                                        control over structure, lessons, and content.
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-600" />
                            </div>
                        </motion.button>

                        {/* AI-Assisted Creation Option */}
                        <motion.button
                            type="button"
                            onClick={handleAICreation}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleAICreation();
                                }
                            }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                'group relative flex w-full items-start gap-5 rounded-2xl border-2 border-violet-200 bg-white p-5 text-left shadow-sm transition-all duration-300',
                                'hover:border-violet-400 hover:bg-violet-50 hover:shadow-lg',
                                'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
                                'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-violet-500/5 before:to-purple-500/5 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100'
                            )}
                        >
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                                <Sparkles className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="mb-1.5 text-lg font-semibold text-gray-900">
                                        Create with AI
                                    </h3>
                                    <p className="text-sm leading-relaxed text-gray-600">
                                        Describe your idea in natural language and let AI generate the
                                        full course structure and materials.
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-violet-600" />
                            </div>
                        </motion.button>
                    </div>
                </motion.div>
            </MyDialog>

            {/* Manual Creation Dialog */}
            <MyDialog
                trigger={<></>}
                heading={`Add ${courseTerm}`}
                dialogWidth="w-[500px]"
                open={openManualDialog}
                onOpenChange={handleManualOpenChange}
                isTour
            >
                <AddCourseForm isEdit={false} />
            </MyDialog>
        </>
    );
};
