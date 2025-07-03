import { Separator } from '@/components/ui/separator';
import { VacademyAssessLogo, VacademyLMSLogo } from '@/svgs';
import { useState, useEffect } from 'react';
import { CreateOnboardingSidebar } from './CreateOnboardingSidebar';
import { OnboardingSteps } from './OnboardingSteps';
import { Route } from '..';
import { handleOAuthCallback } from '@/hooks/signup/oauth-signup'; // ✅ Make sure this path is correct
import { toast } from 'sonner';

export function OnboardingComponent() {
    const searchParams = Route.useSearch();
    const steps = ['Organization Setup', 'Organization Theme', 'Add Your Details'];
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([false, false]);

    const completeCurrentStep = () => {
        setCompletedSteps((prev) => {
            const updated = [...prev];
            updated[currentStep] = true;
            return updated;
        });
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const goToStep = (index: number) => {
        if (index <= currentStep || completedSteps[index - 1]) {
            setCurrentStep(index);
        }
    };

    // // ✅ OAuth Callback & OTP Verification Handling
    // useEffect(() => {
    //     const checkOAuth = async () => {
    //         const result = await handleOAuthCallback();

    //         if (result?.success) {
    //             console.log('✅ OAuth Verified:', result.signupData);
    //             // Optional: store result.signupData in global state
    //         } else if (result?.reason === 'unverified_email') {
    //             console.warn('⚠️ OTP modal was closed without verification.');
    //             toast.warning('Email verification required to continue.');
    //             // Optional: redirect or halt progress
    //         } else {
    //             console.error('❌ OAuth Callback Failed or Skipped.');

    //         }
    //     };

    //     checkOAuth();
    // }, []);

    return (
        <div className="flex h-screen w-full">
            <div className="flex w-1/2 flex-col items-center justify-center bg-primary-50">
                <div>
                    <div className="flex items-center">
                        {searchParams.assess && <VacademyAssessLogo />}
                        {searchParams.lms && <VacademyLMSLogo />}
                    </div>
                    <p>Fast-track your access in 3 steps—explore the tool now!</p>
                    <Separator className="my-6" />
                    <CreateOnboardingSidebar
                        steps={steps}
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                        onStepClick={goToStep}
                    />
                </div>
            </div>
            <div className="flex w-1/2 items-center justify-center">
                <OnboardingSteps
                    currentStep={currentStep}
                    handleCompleteCurrentStep={completeCurrentStep}
                    completedSteps={completedSteps}
                />
            </div>
        </div>
    );
}
