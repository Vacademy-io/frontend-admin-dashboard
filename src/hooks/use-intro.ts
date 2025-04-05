import { useEffect, useState } from "react";
import introJs from "intro.js";
import "intro.js/introjs.css";
import useLocalStorage from "./use-local-storage";

export interface Step {
    element: string;
    title: string;
    intro: string;
    position?: "left" | "right" | "top" | "bottom";
    subStep?: Step[];
}

interface UseIntroJsTourProps {
    key: string;
    steps: Step[];
    partial?: boolean;
    onTourExit?: () => void;
}

const useIntroJsTour = ({ key, steps, onTourExit }: UseIntroJsTourProps) => {
    const { getValue, setValue } = useLocalStorage<boolean>(key, false);
    const [hasDisplayedIntro, setHasDisplayedIntro] = useState(false);

    const isSingleStep = steps.length === 1;

    useEffect(() => {
        if (!getValue() && !hasDisplayedIntro) {
            const instance = introJs();

            instance.setOptions({
                showProgress: !isSingleStep,
                showBullets: false,
                exitOnOverlayClick: false,
                keyboardNavigation: true,
                nextLabel: "Next",
                prevLabel: "Previous",
                highlightClass: "custom-highlight",
                tooltipClass: `custom-tooltip `,
                steps,
                doneLabel: "Done",
                exitOnEsc: true,
            });

            let lastTarget: Element | null = null;

            instance.onafterchange((targetElement) => {
                if (lastTarget) {
                    lastTarget.removeEventListener("click", handleTargetClick);
                }

                targetElement.addEventListener("click", handleTargetClick);
                lastTarget = targetElement;
            });

            const handleTargetClick = () => {
                instance.exit(true);
                setValue(true);
                if (onTourExit) onTourExit();
            };

            instance.oncomplete(() => {
                setValue(true);
                if (onTourExit) onTourExit();
            });

            instance.onexit(() => {
                setValue(true);
                if (onTourExit) onTourExit();
            });

            instance.start();
            setHasDisplayedIntro(true);
        }
    }, [getValue, hasDisplayedIntro, key, onTourExit, setValue, steps]);

    return null;
};

export default useIntroJsTour;
