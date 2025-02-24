import { useEffect, useState } from "react";
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
    const [hasDisplayedIntro, setHasDisplayedIntro] = useState(false);

    useEffect(() => {
        if (!getValue() && !hasDisplayedIntro) {
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
                exitOnEsc: true,
            });

            let clickListener: (event: MouseEvent) => void;
            let exitByClickingOutside = false; // Flag to track exit by clicking outside

            instance.onchange(() => {
                if (clickListener) {
                    document.removeEventListener("click", clickListener);
                }
                const targetElement = document.querySelector(
                    steps[instance._currentStep]?.element ?? "",
                );

                // on click outside of introjs
                clickListener = (event: MouseEvent) => {
                    const target = event.target as HTMLElement;
                    if (target.classList.contains("introjs-overlay")) {
                        exitByClickingOutside = true; // Set the flag
                        instance.exit(true);
                    }
                };

                // on click on target element
                const clickOnTarget = () => {
                    console.log("clicked on target");
                    instance.exit(true);
                };

                targetElement?.addEventListener("click", clickOnTarget);
                document.addEventListener("click", clickListener);
            });

            instance.onbeforeexit(() => {
                if (exitByClickingOutside) {
                    exitByClickingOutside = false; // Reset the flag
                    return true; // Bypass confirmation
                }
                if (steps.length > 0 && instance._currentStep === steps.length - 1) {
                    if (!partial) setValue(true);
                    if (onTourExit) {
                        onTourExit();
                    }
                    return true;
                }
                console.log("triggerd1");
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
            setHasDisplayedIntro(true);
        }
    }, [getValue, setValue, steps, key, onTourExit, hasDisplayedIntro]);

    // Optional: Reset the state if needed
    // useEffect(() => {
    //     return () => {
    //         setHasDisplayedIntro(false);
    //     };
    // }, []);
};

export default useIntroJsTour;
