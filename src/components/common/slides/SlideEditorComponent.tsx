/* eslint-disable */
// @ts-check
"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { defaultSlides } from "./constant/defaultSlides";
import { SlideEditor } from "./SlideEditor";
import type { Slide } from "./types";
import { Button } from "@/components/ui/button";
import { ListStart, Settings } from "lucide-react";
import SlideList from "./SlideList";

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
        console.log(elements , 'elements')
        const newSlides = slides.map((slide) =>
            slide.id === id ? { ...slide, elements: elements.filter((e) => !e.isDeleted) } : slide,
        );
        setSlides(newSlides);
    };

    const changeCurrentSlide = (id: string) => {
        setCurrentSlide(id);
    };

    const addSlide = () => {
        const newSlide = { id: String(Math.random()), elements: [] };
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
   
    // useEffect(()=> {
    //  const it =  slides.filter((item)=> item.id ==currentSlide);
       
    //   console.log(slides , it , 'currentSlide')
    // },[currentSlide , slides])
    return (
        <div className="flex h-screen w-full bg-white">
            <div className="flex size-full flex-col rounded-xl bg-primary-100 p-1">
                <div className="mb-2 flex justify-end gap-2 rounded-md bg-primary-200 p-3">
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

                <div className="flex flex-1 gap-4">
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
                    />

                    <div className="flex flex-1 flex-col">
                        <div className="relative flex-1 rounded-xl border-2 border-primary-300">
                            {!editMode && (
                                <div className="absolute inset-0 z-10 rounded-lg bg-black/50" />
                            )}
                            {currentSlide !== undefined ? (
                                <SlideEditor
                                    editMode={editMode}
                                    slide={getSlide(currentSlide)!}
                                    onSlideChange={(elements) =>
                                        updateSlide(currentSlide, elements)
                                    }
                                    key={currentSlide}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    Excalidraw
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-center gap-2">
                            <Button
                                disabled={isFirstSlide}
                                onClick={goToPreviousSlide}
                                className="gap-2 bg-primary-400"
                            >
                                ←
                            </Button>
                            <Button
                                disabled={isLastSlide}
                                onClick={goToNextSlide}
                                className="gap-2 bg-primary-400"
                            >
                                →
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}