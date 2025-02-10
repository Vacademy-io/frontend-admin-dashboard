import { useEffect } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import useLocalStorage from "./use-local-storage";
import { IntroJs } from "intro.js/src/intro";

export interface Step {
    element: string;
    title: string;
    intro: string;
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

            instance.setOptions({
                showProgress: true,
                showBullets: false,
                exitOnOverlayClick: false,
                keyboardNavigation: true,
                nextLabel: "Next",
                prevLabel: "Previous",
                doneLabel: "Finish",
                highlightClass: "custom-highlight",
                tooltipClass: "custom-tooltip",
                steps,
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

            instance.start();
        }
    }, [getValue, setValue, steps, key, onTourExit]);
};

export default useIntroJsTour;
