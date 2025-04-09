"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { useExportSettings } from "../contexts/export-settings-context";
import { processHtmlString, getBase64FromUrl } from "../utils/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Question } from "../types/question";
import { Resizable } from "re-resizable";
import { RefreshCw } from "lucide-react";

interface QuestionComponentProps {
    question: Question;
    questionNumber: number;
    showMarks?: boolean;
    showCheckboxes?: boolean;
}

export function QuestionComponent({
    question,
    showMarks = true,
    showCheckboxes = false,
}: QuestionComponentProps) {
    const { settings, updateSettings } = useExportSettings();
    const marks = JSON.parse(question.marking_json)?.data?.totalMark || 0;
    const [base64Images, setBase64Images] = useState<{ [key: string]: string }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [aspectRatios, setAspectRatios] = useState<{ [key: string]: number }>({});
    const imageRefs = useRef<{ [key: string]: HTMLImageElement | null }>({});

    // Determine font size class
    const getFontSizeClass = () => {
        switch (settings.fontSize) {
            case "small":
                return "text-xs";
            case "large":
                return "text-base";
            default:
                return "text-sm";
        }
    };

    // Get initial image dimensions
    const getInitialDimensions = (imageUrl: string) => {
        // If custom size is saved, use that first
        if (settings.customImageSizes && settings.customImageSizes[imageUrl]) {
            return settings.customImageSizes[imageUrl];
        }

        // If we have loaded the image and know its natural dimensions
        const imageRef = imageRefs.current[imageUrl];
        if (imageRef && imageRef.naturalWidth && imageRef.naturalHeight) {
            // Apply max constraints for reasonable sizing
            const maxWidth = 400;
            const maxHeight = 300;

            let width = imageRef.naturalWidth;
            let height = imageRef.naturalHeight;

            // Scale down if image is too large
            if (width > maxWidth) {
                const scale = maxWidth / width;
                width = maxWidth;
                height = height * scale;
            }

            if (height > maxHeight) {
                const scale = maxHeight / height;
                height = maxHeight;
                width = width * scale;
            }

            return { width, height };
        }

        // Default dimensions as fallback until image loads
        return { width: 250, height: 250 };
    };

    // Save image dimensions to settings
    const saveImageDimensions = (
        imageUrl: string,
        dimensions: { width: number; height: number },
    ) => {
        const newCustomSizes = {
            ...(settings.customImageSizes || {}),
            [imageUrl]: dimensions,
        };

        updateSettings({
            ...settings,
            customImageSizes: newCustomSizes,
        });
    };

    // Reset image to default size
    const resetImage = (e: React.MouseEvent, imageUrl: string) => {
        e.stopPropagation();

        const newCustomSizes = { ...settings.customImageSizes };
        delete newCustomSizes[imageUrl];

        updateSettings({
            ...settings,
            customImageSizes: newCustomSizes,
        });
    };

    // Calculate and store aspect ratios for images
    const calculateAspectRatio = (imageUrl: string, img: HTMLImageElement) => {
        const ratio = img.naturalWidth / img.naturalHeight;
        setAspectRatios((prev) => ({ ...prev, [imageUrl]: ratio }));
    };

    // Convert image URLs to base64
    useEffect(() => {
        const convertImagesToBase64 = async () => {
            const images = processHtmlString(question.question.content)
                .filter((item) => item.type === "image")
                .map((item) => item.content);

            const optionImages = question.options_with_explanation.flatMap((option) =>
                processHtmlString(option.text.content)
                    .filter((item) => item.type === "image")
                    .map((item) => item.content),
            );

            const allImages = [...images, ...optionImages];
            const base64Map: { [key: string]: string } = {};

            for (const imageUrl of allImages) {
                try {
                    const base64 = await getBase64FromUrl(imageUrl);
                    base64Map[imageUrl] = base64 as string;
                } catch (error) {
                    console.error(`Failed to convert image to base64: ${imageUrl}`, error);
                }
            }

            setBase64Images(base64Map);
        };

        convertImagesToBase64();
    }, [question]);

    // Reset selection when question changes
    useEffect(() => {
        setSelectedImage(null);
    }, [question]);

    // Render an image with resize functionality
    const renderImage = (imageUrl: string, index: number) => {
        const isSelected = selectedImage === imageUrl;
        const initialSize = getInitialDimensions(imageUrl);

        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.currentTarget;
            imageRefs.current[imageUrl] = img;
            calculateAspectRatio(imageUrl, img);
        };

        return (
            <div
                key={index}
                className="relative inline-block align-middle"
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(isSelected ? null : imageUrl);
                }}
            >
                <Resizable
                    size={{ width: initialSize.width, height: initialSize.height }}
                    onResizeStop={(e, direction, ref, d) => {
                        const newWidth = initialSize.width + d.width;
                        const newHeight = initialSize.height + d.height;
                        saveImageDimensions(imageUrl, { width: newWidth, height: newHeight });
                    }}
                    lockAspectRatio={aspectRatios[imageUrl] || true}
                    maxWidth={600}
                    maxHeight={600}
                    className={`${isSelected ? "ring-2 ring-primary-500" : ""}`}
                    handleStyles={{
                        right: {
                            width: "6px",
                            height: "40px",
                            right: "-3px",
                            top: "calc(50% - 20px)",
                            background: "#3b82f6",
                            borderRadius: "3px",
                            cursor: "ew-resize",
                            visibility: isSelected ? "visible" : "hidden",
                        },
                    }}
                    handleClasses={{
                        right: "data-html2canvas-ignore",
                    }}
                    enable={{
                        top: false,
                        right: isSelected,
                        bottom: false,
                        left: false,
                        topRight: false,
                        bottomRight: false,
                        bottomLeft: false,
                        topLeft: false,
                    }}
                >
                    <img
                        src={base64Images[imageUrl] || imageUrl}
                        alt={`Question image ${index + 1}`}
                        className="size-full object-contain"
                        onLoad={handleImageLoad}
                    />

                    {/* Reset button and size indicator - will be excluded from screenshots */}
                    {isSelected && (
                        <>
                            <button
                                className="absolute right-0 top-0 z-10 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                                onClick={(e) => resetImage(e, imageUrl)}
                            >
                                <RefreshCw size={14} />
                            </button>

                            <div className="absolute -top-7 left-0 z-10 rounded bg-primary-200 px-2 py-0.5 text-xs shadow-md">
                                {Math.round(initialSize.width)} × {Math.round(initialSize.height)}
                            </div>
                        </>
                    )}
                </Resizable>
            </div>
        );
    };

    return (
        <div className={`space-y-4 ${getFontSizeClass()}`} onClick={() => setSelectedImage(null)}>
            <div className="flex items-start justify-between gap-4">
                <div className="text-slate-800">
                    <p className="question-container gap-x-1 font-bold">
                        {question.question_order}
                        {")"}.
                        <p>
                            {processHtmlString(question.question.content).map((item, index) =>
                                item.type === "text" ? (
                                    <span key={index}>{item.content}</span>
                                ) : (
                                    renderImage(item.content, index)
                                ),
                            )}
                        </p>
                    </p>
                    <p>{}</p>
                </div>
                {showMarks && (
                    <div className="whitespace-nowrap rounded-md px-1 text-sm font-semibold text-gray-600">
                        {marks.toString()}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 pl-6">
                {question.options_with_explanation.map((option, index) => (
                    <div key={option.id} className="option-container gap-x-1">
                        {showCheckboxes && <Checkbox className="pointer-events-none" />}
                        <Label className="">
                            {String.fromCharCode(97 + index)}
                            {")"}.{" "}
                            {processHtmlString(option.text.content).map((item, index) =>
                                item.type === "text" ? (
                                    <span key={item.content.slice(0, 10) + index} id="text-content">
                                        {item.content}
                                    </span>
                                ) : (
                                    <img
                                        key={index}
                                        src={base64Images[item.content] || item.content}
                                        alt={`Question image ${index + 1}`}
                                        className=""
                                    />
                                ),
                            )}
                        </Label>
                    </div>
                ))}
            </div>
        </div>
    );
}
