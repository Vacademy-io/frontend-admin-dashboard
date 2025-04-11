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
import { fullMediaSlide, textMediaSlide, textSlide, titleSlide, videoSlide, webEmbedSlide } from "./constant/textSlide";
import { SlideType } from "./constant/slideType";
import { createNewSlide } from "./utils/util";
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';
import { MainViewQuillEditor } from "@/components/quill/MainViewQuillEditor";
import { QuizeSlide } from "./slidesTypes/QuizSlides";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";



const saveSlidesInLocalStorage = (slides: Slide[]) => {
    localStorage.setItem("slides", JSON.stringify(slides));
};

const getSlidesFromLocalStorage = (): Slide[] => {
    const json = localStorage.getItem("slides");
    return json ? JSON.parse(json) : null;
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
        // console.log(elements , 'elements')
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
            // Find the slide container to capture
            const slideContainer = document.querySelector('.excalidraw__canvas');
            
            if (!slideContainer) {
                console.error('Slide container not found');
                return;
            }

            // Use html2canvas to generate the screenshot
            const canvas = await html2canvas(slideContainer as HTMLElement, {
                useCORS: true, // Handle cross-origin images
                scale: 2, // Increase resolution
                logging: false, // Disable logging
                allowTaint: true, // Allow drawing images from different origins
            });

            // Convert canvas to blob
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.error('Failed to create blob');
                    return;
                }

                // Create a link element to trigger download
                const link = document.createElement('a');
                link.download = `slide_screenshot_${new Date().toISOString()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();

                // Clean up
                URL.revokeObjectURL(link.href);
            });
        } catch (error) {
            console.error('Screenshot failed:', error);
            // Optional: show user-friendly error toast
        }
    };

    // Function to export slides to PowerPoint
    const exportToPowerPoint = async () => {
        try {
            // Create a new PowerPoint presentation
            const pptx = new PptxGenJS();
            
            // Iterate through slides and add them to the presentation
            for (const slide of slides) {
                // Create a new slide in the presentation
                const pptxSlide = pptx.addSlide();
                
                try {
                    // Find the specific slide container for this slide
                    const slideContainer = document.querySelector(`.excalidraw__canvas`);
                    
                    if (!slideContainer) {
                        console.warn(`Slide container for slide ${slide.id} not found`);
                        continue;
                    }

                    // Use html2canvas to convert slide to image
                    const canvas = await html2canvas(slideContainer as HTMLElement, {
                        useCORS: true,
                        scale: 2,
                        logging: false,
                        allowTaint: true,
                    });

                    // Convert canvas to data URL
                    const imageData = canvas.toDataURL('image/png');

                    // Add the image to the PowerPoint slide
                    pptxSlide.addImage({
                        data: imageData,
                        x: 0.5,
                        y: 0.5,
                        w: 9, // Adjust width as needed
                        h: 5.5, // Adjust height as needed
                    });
                } catch (slideError) {
                    console.error(`Error processing slide ${slide.id}:`, slideError);
                }
            }

            // Save the PowerPoint file
            pptx.writeFile({
                fileName: `Presentation_${new Date().toISOString().replace(/:/g, '-')}.pptx`
            });
        } catch (error) {
            console.error('PowerPoint export failed:', error);
            // Optional: show user-friendly error toast
        }
    };


    const SlideRenderer = ({ type, currentSlide  , questionType }) => {
        switch (type) {
          case SlideType.Quiz:
             return <QuizeSlide formdata={getSlide(currentSlide)! }  className={"flex flex-col"} questionType={type} />
         case SlideType.Feedback:
             return <QuizeSlide formdata={getSlide(currentSlide)! }  className={"flex flex-col"} questionType={type} />
          default:
            return <SlideEditor
            editMode={editMode}
            slide={getSlide(currentSlide)!}
            onSlideChange={(elements) =>
                updateSlide(currentSlide, elements)
            }
            key={currentSlide}
        />
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

                <div 
                    className="slide-container flex  gap-4 bg-primary-100"
                    style={{ position: 'relative' }}
                >
                    {slides.map((slide, index) => (
                        <div 
                            key={slide.id} 
                            className={`slide-${slide.id}`}
                            style={{ 
                                display: slide.id === currentSlide ? 'block' : 'none',
                               
                                height: '100%'
                            }}
                        >
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
                                onReorderSlides={(slides : Slide[])=>{
                                  setSlides(slides)
                                }}
                            />
                        </div>
                    ))}
                    <div className="flex flex-1 flex-col bg-white">
                        <div className="relative flex-1 rounded-xl border-2 border-primary-300">
                            {!editMode && (
                                <div className="absolute inset-0 z-10 rounded-lg bg-black/50" />
                            )}
                              <SlideRenderer
                                  currentSlide={currentSlide}
                                  type={getSlide(currentSlide)?.type}
                                />
                        </div>

                       
                    </div>
                </div>
            </div>
        </div>
    );
}