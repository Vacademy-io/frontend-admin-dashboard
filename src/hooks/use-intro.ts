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
    subStep?: Step[];
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
    const [introInstance, setIntroInstance] = useState<IntroJs | null>(null);

    useEffect(() => {
        if (!getValue() && !hasDisplayedIntro) {
            // Cleanup existing instance before starting a new one
            if (introInstance) {
                introInstance.exit(true);
            }

            const instance: IntroJs = introJs();
            setIntroInstance(instance);

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
            let exitByClickingOutside = false; // Track exit by clicking outside

            instance.onchange(() => {
                // Cleanup previous listeners
                if (clickListener) {
                    document.removeEventListener("click", clickListener);
                }

                const targetElement = document.querySelector(
                    steps[instance._currentStep]?.element ?? "",
                );

                if (targetElement) {
                    const oldClickOnTarget = targetElement.getAttribute("data-intro-click");
                    if (oldClickOnTarget) {
                        targetElement.removeEventListener("click", JSON.parse(oldClickOnTarget));
                    }
                }

                // Handle click outside to exit
                clickListener = (event: MouseEvent) => {
                    event.stopPropagation();
                    const target = event.target as HTMLElement;
                    if (target.classList.contains("introjs-overlay")) {
                        exitByClickingOutside = true;
                        instance.exit(true);
                    }
                };

                // Handle click on the target element
                const clickOnTarget = (e: Event) => {
                    e.stopPropagation();
                    instance.exit(true);
                };

                if (targetElement) {
                    targetElement.setAttribute("data-intro-click", JSON.stringify(clickOnTarget));
                    targetElement.addEventListener("click", clickOnTarget, { once: true });
                }

                // document.addEventListener("click", clickListener);
            });

            instance.onbeforeexit(() => {
                // If exited by clicking outside, allow it without confirmation
                if (exitByClickingOutside) {
                    exitByClickingOutside = false;
                    return true;
                }

                // Directly allow exit without confirmation for all steps
                return true; // Allow normal exit
            });

            instance.onexit(() => {
                // Cleanup state and call exit callback
                console.log("all completed");
                setHasDisplayedIntro(false);
                if (!partial) setValue(true);
                if (onTourExit) onTourExit();
            });

            // For single step, auto-complete after a delay
            if (isSingleStep) {
                instance.oncomplete(() => {
                    console.log("single step completed");
                    if (!partial) setValue(true);
                    if (onTourExit) onTourExit();
                });
            }

            instance.start();
            setHasDisplayedIntro(true);
        }

        return () => {
            // Cleanup on unmount
            if (introInstance) {
                introInstance.exit(true);
            }
        };
    }, [getValue, setValue, steps, key, onTourExit, hasDisplayedIntro]);

    return null;
};

export default useIntroJsTour;
