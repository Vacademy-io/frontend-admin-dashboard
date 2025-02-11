import { useEffect } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import useLocalStorage from "./use-local-storage";
import { IntroJs } from "intro.js/src/intro";

export interface Step {
    element: string;
    title: string;
    intro: string;
    position?: "left" | "right" | "top" | "bottom";
}

interface UseIntroJsTourProps {
    key: string;
    steps: Step[];
    partial?: boolean;
    onTourExit?: () => void;
}

const useIntroJsTour = ({ key, steps, partial = false, onTourExit }: UseIntroJsTourProps) => {
    const { getValue, setValue } = useLocalStorage<boolean>(key, false);

    useEffect(() => {
        if (!getValue()) {
            const instance: IntroJs = introJs();

            // Handle single step case
            const isSingleStep = steps.length === 1;

            instance.setOptions({
                showProgress: !isSingleStep,
                showBullets: false,
                exitOnOverlayClick: false,
                keyboardNavigation: true,
                nextLabel: "Next",
                prevLabel: "Previous",
                highlightClass: "custom-highlight",
                tooltipClass: `custom-tooltip ${isSingleStep ? "single-step" : ""}`,
                steps,
                doneLabel: isSingleStep ? " " : "Done",
            });

            instance.onbeforeexit(() => {
                if (steps.length > 0 && instance._currentStep === steps.length - 1) {
                    if (!partial) setValue(true);
                    if (onTourExit) {
                        onTourExit();
                    }
                    return true;
                }
                return confirm("Are you sure you want to exit?");
            });

            // For single step, auto-complete after a delay
            if (isSingleStep) {
                instance.oncomplete(() => {
                    if (!partial) setValue(true);
                    if (onTourExit) {
                        onTourExit();
                    }
                });
            }

            instance.start();
        }
    }, [getValue, setValue, steps, key, onTourExit]);
};

export default useIntroJsTour;
