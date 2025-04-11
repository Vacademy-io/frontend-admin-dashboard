import { useRef, useState } from "react";
import ReactQuill from "react-quill";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { convertSVGsToBase64 } from "../-utils/helper";

interface GeneratePageWiseAssessmentProps {
    openPageWiseAssessmentDialog: boolean;
    setOpenPageWiseAssessmentDialog: React.Dispatch<React.SetStateAction<boolean>>;
    htmlData: string | null;
}

const GeneratePageWiseAssessment = ({
    openPageWiseAssessmentDialog,
    setOpenPageWiseAssessmentDialog,
    htmlData,
}: GeneratePageWiseAssessmentProps) => {
    const rightEditorRef = useRef<ReactQuill | null>(null);
    const leftContentRef = useRef<HTMLDivElement | null>(null);

    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedText, setSelectedText] = useState("");

    const handleLeftSelection = (event: React.MouseEvent<HTMLDivElement>) => {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const container = document.createElement("div");
            container.appendChild(range.cloneContents());
            const html = container.innerHTML.trim();

            if (html.length > 0) {
                setSelectedText(html); // Save selected HTML
                setPopupVisible(true);
                return;
            }
        }

        // Handle direct clicks on images or SVGs (no selection)
        const target = event.target as HTMLElement;
        const closestSvg = target.closest("svg");
        const closestImg = target.closest("img");

        if (closestSvg) {
            setSelectedText(closestSvg.outerHTML);
            setPopupVisible(true);
        } else if (closestImg) {
            setSelectedText(closestImg.outerHTML);
            setPopupVisible(true);
        }
    };

    const handleConfirmCopy = () => {
        const rightEditor = rightEditorRef.current?.getEditor();
        const currentLength = rightEditor?.getLength() ?? 0;

        if (selectedText) {
            // Use dangerouslyPasteHTML to insert full HTML (including images, svg, etc.)
            rightEditor?.clipboard.dangerouslyPasteHTML(currentLength, selectedText);
        }

        setPopupVisible(false);
        setSelectedText("");
    };
    return (
        <>
            <Dialog
                open={openPageWiseAssessmentDialog}
                onOpenChange={setOpenPageWiseAssessmentDialog}
            >
                <DialogContent className="no-scrollbar !m-0 flex h-full !w-full !max-w-full flex-col !gap-0 overflow-y-auto !rounded-none !p-0">
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Left Viewer */}
                            <div onMouseUp={handleLeftSelection}>
                                <h2 className="mb-2 text-lg font-semibold">Left Viewer</h2>
                                <div
                                    ref={leftContentRef}
                                    onMouseUp={handleLeftSelection}
                                    className="rounded border p-4"
                                    dangerouslySetInnerHTML={{
                                        __html: convertSVGsToBase64(htmlData ?? "") || "",
                                    }}
                                />
                            </div>

                            {/* Right Editor */}
                            <div>
                                <h2 className="mb-2 text-lg font-semibold">Right Editor</h2>
                                <ReactQuill ref={rightEditorRef} theme="snow" />
                            </div>
                        </div>

                        {/* Popup */}
                        <Dialog open={popupVisible} onOpenChange={setPopupVisible}>
                            <DialogContent className="flex w-auto flex-col gap-4 p-0">
                                <h1 className="rounded-t-lg bg-primary-50 p-4 font-semibold text-primary-500">
                                    Alert
                                </h1>
                                <p className="px-4">Are you sure you want to copy selected text?</p>
                                <div className="flex items-center justify-between gap-4 px-4 pb-4">
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="secondary"
                                        layoutVariant="default"
                                        className="text-sm"
                                        onClick={() => setPopupVisible(false)}
                                    >
                                        No
                                    </MyButton>
                                    <MyButton
                                        type="button"
                                        scale="medium"
                                        buttonType="primary"
                                        layoutVariant="default"
                                        className="text-sm"
                                        onClick={handleConfirmCopy}
                                    >
                                        Yes
                                    </MyButton>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default GeneratePageWiseAssessment;
