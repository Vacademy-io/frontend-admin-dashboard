/* eslint-disable */
// @ts-nocheck
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { defaultSlides } from "./constant/defaultSlides";
import { SlideEditor } from "./SlideEditor";
import type { Slide } from "./types";
import { Button } from "@/components/ui/button";
import { ListStart, Settings, FileDown } from "lucide-react";
import SlideList from "./SlideList";
import { SlideType } from "./constant/slideType";
import { createNewSlide } from "./utils/util";
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';
import { QuizeSlide } from "./slidesTypes/QuizSlides";

const saveSlidesInLocalStorage = (slides: Slide[]) => {
    localStorage.setItem("slides", JSON.stringify(slides));
};

const getSlidesFromLocalStorage = (): Slide[] => {
    const json = localStorage.getItem("slides");
    return json ? JSON.parse(json) : null;
};

interface SlideRendererProps {
    type: SlideType;
    currentSlide: string;
    editMode: boolean;
    getSlide: (id: string) => Slide | undefined;
    updateSlide: (id: string, elements: any[]) => void;
}

const SlideRenderer = ({ type, currentSlide, editMode, getSlide, updateSlide }: SlideRendererProps) => {
    const slide = getSlide(currentSlide);
    
    if (!slide) return null;

    switch (type) {
        case SlideType.Quiz:
        case SlideType.Feedback:
            return <QuizeSlide formdata={slide} className={"flex flex-col"} questionType={type} />;
        default:
            return (
                <SlideEditor
                    editMode={editMode}
                    slide={slide}
                    onSlideChange={(elements) => updateSlide(currentSlide, elements)}
                    key={currentSlide}
                />
            );
    }
};

export default function SlidesEditor() {
    const [editMode, setEditMode] = useState(true);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentSlide, setCurrentSlide] = useState<string | undefined>(undefined);

    // Initialize slides from localStorage or defaultSlides
    useEffect(() => {
        const savedSlides = getSlidesFromLocalStorage();
        const initialSlides = savedSlides && savedSlides.length > 0 ? savedSlides : defaultSlides;
        setSlides(initialSlides);
        setCurrentSlide(initialSlides[0]?.id);
    }, []);

    // Save slides to localStorage whenever slides state changes
    useEffect(() => {
        if (slides.length > 0) {
            saveSlidesInLocalStorage(slides);
        }
    }, [slides]);

    const getSlide = (id: string) => slides.find((s) => s.id === id);

    const updateSlide = (id: string, elements: any[]) => {
        const newSlides = slides.map((slide) =>
            slide.id === id ? { ...slide, elements: elements.filter((e) => !e.isDeleted) } : slide,
        );
        setSlides(newSlides);
    };

    const changeCurrentSlide = (id: string) => {
        setCurrentSlide(id);
    };

    const addSlide = (type: SlideType) => {
        const newSlide = createNewSlide(type);
        const newSlides = [...slides, newSlide];
        setSlides(newSlides);
        changeCurrentSlide(newSlide.id);
    };

    const slideIndex = slides.findIndex((s) => s.id === currentSlide);
    const isFirstSlide = slideIndex === 0;
    const isLastSlide = slideIndex === slides.length - 1;

    const goToNextSlide = () => {
        if (!isLastSlide) changeCurrentSlide(slides[slideIndex + 1].id);
    };

    const goToPreviousSlide = () => {
        if (!isFirstSlide) changeCurrentSlide(slides[slideIndex - 1].id);
    };

    const toggleEditMode = () => {
        setEditMode((e) => !e);
    };

    const moveSlideUp = () => {
        if (isFirstSlide) return;

        const newSlides = [...slides];
        const temp = newSlides[slideIndex];
        newSlides[slideIndex] = newSlides[slideIndex - 1];
        newSlides[slideIndex - 1] = temp;

        setSlides(newSlides);
    };

    const moveSlideDown = () => {
        if (isLastSlide) return;

        const newSlides = [...slides];
        const temp = newSlides[slideIndex];
        newSlides[slideIndex] = newSlides[slideIndex + 1];
        newSlides[slideIndex + 1] = temp;

        setSlides(newSlides);
    };

    const deleteSlide = () => {
        if (slides.length === 1) return;

        const newSlides = slides.filter((s) => s.id !== currentSlide);
        setSlides(newSlides);

        if (isLastSlide) {
            changeCurrentSlide(newSlides[newSlides.length - 1].id);
        } else {
            changeCurrentSlide(newSlides[slideIndex].id);
        }
    };

    const exportFile = () => {
        const a = document.createElement("a");
        a.setAttribute(
            "href",
            "data:application/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(slides, undefined, 2)),
        );
        a.setAttribute("download", "Untitled.edslides");
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const importFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const json = e.target?.result as string;
                try {
                    const slides = JSON.parse(json);
                    setSlides(slides);
                    changeCurrentSlide(slides[0].id);
                    input.value = "";
                } catch (err) {
                    alert("Something went wrong when importing the file.");
                    console.error(err);
                }
            };
            reader.readAsText(input.files[0]);
        }
    };

    const takeScreenshot = async () => {
        try {
            const slideContainer = document.querySelector('.excalidraw__canvas');
            
            if (!slideContainer) {
                console.error('Slide container not found');
                return;
            }

            const canvas = await html2canvas(slideContainer as HTMLElement, {
                useCORS: true,
                scale: 2,
                logging: false,
                allowTaint: true,
            });

            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob');
                    return;
                }

                const link = document.createElement('a');
                link.download = `slide_screenshot_${new Date().toISOString()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            });
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    };

    const exportToPowerPoint = async () => {
        try {
            const pptx = new PptxGenJS();
            
            for (const slide of slides) {
                const pptxSlide = pptx.addSlide();
                
                try {
                    const slideContainer = document.querySelector(`.excalidraw__canvas`);
                    
                    if (!slideContainer) {
                        console.warn(`Slide container for slide ${slide.id} not found`);
                        continue;
                    }

                    const canvas = await html2canvas(slideContainer as HTMLElement, {
                        useCORS: true,
                        scale: 2,
                        logging: false,
                        allowTaint: true,
                    });

                    const imageData = canvas.toDataURL('image/png');

                    pptxSlide.addImage({
                        data: imageData,
                        x: 0.5,
                        y: 0.5,
                        w: 9,
                        h: 5.5,
                    });
                } catch (slideError) {
                    console.error(`Error processing slide ${slide.id}:`, slideError);
                }
            }

            pptx.writeFile({
                fileName: `Presentation_${new Date().toISOString().replace(/:/g, '-')}.pptx`
            });
        } catch (error) {
            console.error('PowerPoint export failed:', error);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white">
            <div className="flex size-full flex-col rounded-xl bg-base-white">
                <div className="flex justify-end gap-2 rounded-md bg-primary-200 p-1 mb-1 min-h-32">
                    <Button 
                        variant="destructive" 
                        onClick={takeScreenshot}
                    >
                        <Settings className="size-4" />
                        SnapShot
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={exportToPowerPoint}
                    >
                        <FileDown className="size-4" />
                        Export PPT
                    </Button>
                    <Button variant="destructive">
                        <Settings className="size-4" />
                        Settings
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={toggleEditMode}
                        className="gap-2 bg-primary-400"
                    >
                        <ListStart className="size-4" />
                        {editMode ? "Start" : "Edit"}
                    </Button>
                </div>

                <div className="slide-container flex gap-4 bg-primary-100" style={{ position: 'relative' }}>
                    {currentSlide && (
                        <div className={`slide-${currentSlide}`} style={{ 
                            display: 'block',
                            height: '100%'
                        }}>
                            <SlideList
                                slides={slides}
                                currentSlide={currentSlide}
                                onSlideChange={changeCurrentSlide}
                                onAddSlide={addSlide}
                                onMoveSlideUp={moveSlideUp}
                                onMoveSlideDown={moveSlideDown}
                                onDeleteSlide={deleteSlide}
                                onExport={exportFile}
                                onImport={importFile}
                                onReorderSlides={(slides: Slide[]) => {
                                    setSlides(slides);
                                }}
                            />
                        </div>
                    )}
                    <div className="flex flex-1 flex-col bg-white">
                        <div className="relative flex-1 rounded-xl border-2 border-primary-300">
                            {!editMode && (
                                <div className="absolute inset-0 z-10 rounded-lg bg-black/50" />
                            )}
                            {currentSlide && (
                                <SlideRenderer
                                    currentSlide={currentSlide}
                                    type={getSlide(currentSlide)?.type || SlideType.Title}
                                    editMode={editMode}
                                    getSlide={getSlide}
                                    updateSlide={updateSlide}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}