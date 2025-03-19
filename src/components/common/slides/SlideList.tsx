"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { defaultSlides } from "./constant/defaultSlides";
import { ExportIcon, ImportIcon } from "./Icons";
import { SlideEditor } from "./SlideEditor";
import type { Slide } from "./types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ListStart, Settings } from "lucide-react";
import { FileQuestion, GraduationCap, MessageSquare, Presentation } from "lucide-react";
const saveSlidesInLocalStorage = (slides: any) => {
    localStorage.setItem("slides", JSON.stringify(slides));
};

const getSlidesFromLocalStorage = () => {
    const json = localStorage.getItem("slides");
    return json && JSON.parse(json);
};

export default function SlidesEditor() {
    const [editMode, setEditMode] = useState(true);
    const [slides, setSlides] = useState<Array<Slide>>([]);
    const [currentSlide, setCurrentSlide] = useState<string | undefined>(undefined);

    const updateSlides = (slides: Slide[]) => {
        setSlides(slides);
        saveSlidesInLocalStorage(slides);
    };

    useEffect(() => {
        const savedSlides = getSlidesFromLocalStorage();
        const slides = savedSlides && savedSlides.length > 0 ? savedSlides : defaultSlides;
        updateSlides(slides);
        setCurrentSlide(slides[0].id);
    }, []);

    const getSlide = (id: string) => slides.find((s) => s.id === id);

    const updateSlide = (id: string, elements: any[]) => {
        const newSlides = slides.map((slide) =>
            slide.id === id ? { ...slide, elements: elements.filter((e) => !e.isDeleted) } : slide,
        );
        updateSlides(newSlides);
    };

    const changeCurrentSlide = (id: string) => {
        setCurrentSlide(undefined);
        setTimeout(() => setCurrentSlide(id), 10);
    };

    const addSlide = () => {
        const newSlide = { id: String(Math.random()), elements: [] };
        updateSlides([...slides, newSlide]);
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
        changeCurrentSlide(currentSlide!);
    };

    const moveSlideUp = () => {
        if (isFirstSlide) return;

        const newSlides = [...slides];
        const temp = newSlides[slideIndex];
        newSlides[slideIndex] = newSlides[slideIndex - 1];
        newSlides[slideIndex - 1] = temp;

        updateSlides(newSlides);
        changeCurrentSlide(currentSlide!);
    };

    const moveSlideDown = () => {
        if (isLastSlide) return;

        const newSlides = [...slides];
        const temp = newSlides[slideIndex];
        newSlides[slideIndex] = newSlides[slideIndex + 1];
        newSlides[slideIndex + 1] = temp;

        updateSlides(newSlides);
        changeCurrentSlide(currentSlide!);
    };

    const deleteSlide = () => {
        if (slides.length === 1) return;

        const newSlides = slides.filter((s) => s.id !== currentSlide);
        updateSlides(newSlides);

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
                    updateSlides(slides);
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

    const tabs = [
        { name: "Presentation", icon: <Presentation className="mr-2 h-4 w-4" /> },
        { name: "Quiz", icon: <FileQuestion className="mr-2 h-4 w-4" /> },
        { name: "LMS", icon: <GraduationCap className="mr-2 h-4 w-4" /> },
        { name: "Feedback", icon: <MessageSquare className="mr-2 h-4 w-4" /> },
    ];

    return (
        <div className="flex h-screen w-full bg-white">
            <div className="flex flex-col items-center gap-2 border-r bg-primary-200 p-2">
                {tabs.map((tab, index) => (
                    <Button
                        key={tab.name}
                        variant="ghost"
                        className={cn(
                            "flex w-full items-center justify-center gap-1 rounded-lg p-3 text-center hover:bg-primary-400 sm:justify-start",
                            index === 0 && "bg-primary-400",
                        )}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </Button>
                ))}
            </div>
            <div className="flex size-full flex-col rounded-xl bg-primary-100 p-1">
                {/* Top header with Settings and Start buttons */}
                <div className="mb-2 flex justify-end gap-2 rounded-md bg-primary-200 p-3">
                    <Button variant="destructive">
                        {" "}
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

                {/* Main content area with sidebar and editor */}
                <div className="flex flex-1 gap-4">
                    {/* Left sidebar */}
                    <div className="flex w-64 flex-col rounded-xl border-2 bg-primary-200 p-3">
                        <div className="mb-3 flex justify-between">
                            <h2 className="text-lg font-medium">Slides</h2>
                            <div className="flex gap-2">
                                <button
                                    className="rounded p-1 hover:bg-green-50"
                                    onClick={exportFile}
                                    title="Export"
                                >
                                    <ExportIcon width={16} />
                                </button>
                                <label className="cursor-pointer rounded p-1 hover:bg-green-50">
                                    <ImportIcon width={16} />
                                    <input
                                        type="file"
                                        onChange={importFile}
                                        className="sr-only"
                                        accept=".edslides,application/json"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <ul className="space-y-2">
                                {slides.map((slide, index) => (
                                    <li key={slide.id} className="relative">
                                        <div
                                            className={cn(
                                                "flex cursor-pointer items-center justify-between rounded-md border-2 p-2 transition-colors",
                                                slide.id === currentSlide
                                                    ? "bg-green-50 bg-primary-300"
                                                    : "border-primary-200",
                                            )}
                                            onClick={() => changeCurrentSlide(slide.id)}
                                        >
                                            <span className="font-medium">Slide {index + 1}</span>

                                            {slide.id === currentSlide && (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        className="size-6 rounded hover:bg-green-100"
                                                        disabled={isFirstSlide}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSlideUp();
                                                        }}
                                                        title="Move Up"
                                                    >
                                                        ↑
                                                    </button>

                                                    <button
                                                        className="size-6 rounded hover:bg-green-100"
                                                        disabled={isLastSlide}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveSlideDown();
                                                        }}
                                                        title="Move Down"
                                                    >
                                                        ↓
                                                    </button>

                                                    <button
                                                        className="size-6 rounded hover:bg-green-100"
                                                        disabled={slides.length === 1}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteSlide();
                                                        }}
                                                        title="Delete"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-3 border-t border-green-200 pt-3">
                            <Button onClick={addSlide} className="w-full gap-2 bg-primary-400">
                                <span className="mr-1">+</span> Add Slide
                            </Button>
                        </div>
                    </div>

                    {/* Right content area */}
                    <div className="flex flex-1 flex-col">
                        {/* Main editor area */}
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
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    Excalidraw
                                </div>
                            )}
                        </div>

                        {/* Navigation controls */}
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
