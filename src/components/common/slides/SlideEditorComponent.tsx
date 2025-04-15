// SlidesEditor.tsx
/* eslint-disable */
// @ts-nocheck
"use client";

import type React from "react";
import { useEffect } from "react";
import { SlideEditor } from "./SlideEditor";
import { Button } from "@/components/ui/button";
import { ListStart, Settings, FileDown } from "lucide-react";
import SlideList from "./SlideList";
import { SlideType } from "./constant/slideType";
import { QuizeSlide } from "./slidesTypes/QuizSlides";
import { useSlideStore } from "@/stores/Slides/useSlideStore";

const SlideRenderer = ({ 
  type, 
  currentSlideId, 
  editMode ,

}: { 
  type: SlideType; 
  currentSlideId: string; 
  editMode: boolean 
}) => {
  const getSlide = useSlideStore(state => state.getSlide);
  const updateSlide = useSlideStore(state => state.updateSlide);
  const slide = getSlide(currentSlideId);
  
  if (!slide) return null;

  switch (type) {
    case SlideType.Quiz:
    case SlideType.Feedback:
      return <QuizeSlide formdata={slide.elements} className={"flex flex-col"} questionType={type} currentSlideId={currentSlideId} key={currentSlideId} />;
    default:
      return (
        <SlideEditor
          editMode={editMode}
          slide={slide}
          onSlideChange={(elements) => updateSlide(currentSlideId, elements)}
          key={currentSlideId}
        />
      );
  }
};

export default function SlidesEditor() {
  const {
    slides,
    currentSlideId,
    editMode,
    setCurrentSlideId,
    setEditMode,
    addSlide,
    moveSlideUp,
    moveSlideDown,
    deleteSlide,
    getSlide,
    setSlides,
  } = useSlideStore();

  const changeCurrentSlide = (id: string) => {
    setCurrentSlideId(id);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const slideIndex = slides.findIndex((s) => s.id === currentSlideId);
  const isFirstSlide = slideIndex === 0;
  const isLastSlide = slideIndex === slides.length - 1;

  const goToNextSlide = () => {
    if (!isLastSlide) changeCurrentSlide(slides[slideIndex + 1].id);
  };

  const goToPreviousSlide = () => {
    if (!isFirstSlide) changeCurrentSlide(slides[slideIndex - 1].id);
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
          setCurrentSlideId(slides[0]?.id);
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
            className="gap-2"
          >
            <Settings className="size-4" />
            SnapShot
          </Button>
          <Button 
            variant="destructive" 
            onClick={exportToPowerPoint}
            className="gap-2"
          >
            <FileDown className="size-4" />
            Export PPT
          </Button>
          <Button variant="destructive" className="gap-2">
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
          {currentSlideId && (
            <div className={`slide-${currentSlideId}`} style={{ 
              display: 'block',
              height: '100%'
            }}>
              <SlideList
                slides={slides}
                currentSlide={currentSlideId}
                onSlideChange={changeCurrentSlide}
                onAddSlide={addSlide}
                onMoveSlideUp={moveSlideUp}
                onMoveSlideDown={moveSlideDown}
                onDeleteSlide={() => deleteSlide(currentSlideId)}
                onExport={exportFile}
                onImport={importFile}
                onReorderSlides={(slides) => {
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
              {currentSlideId && (
                <SlideRenderer
                currentSlideId={currentSlideId}
                  type={getSlide(currentSlideId)?.type || SlideType.Title}
                  editMode={editMode}
                />
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}