
"use client"

import React, { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExportIcon, ImportIcon } from "./Icons"
import { SlideTypeSheet } from "./slideTypeSheet"
import type { Slide } from "./types"
import type { SlideType } from "./constant/slideType"
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react"

interface SlideListProps {
  slides: Slide[]
  currentSlide: string | undefined
  onSlideChange: (id: string) => void
  onAddSlide: (type?: SlideType) => void
  onMoveSlideUp: () => void
  onMoveSlideDown: () => void
  onDeleteSlide: () => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onReorderSlides: (newSlides: Slide[]) => void
}

export default function SlideList({
  slides,
  currentSlide,
  onSlideChange,
  onAddSlide,
  onMoveSlideUp,
  onMoveSlideDown,
  onDeleteSlide,
  onExport,
  onImport,
  onReorderSlides,
}: SlideListProps) {
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false)

  const handleSelectSlideType = (type: SlideType) => {
    onAddSlide(type)
    setIsTypeSheetOpen(false)
  }

  const handleDragEnd = (result: DropResult) => {
    console.log(result ,'result')
    if (!result.destination) return

    const reordered = Array.from(slides)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    localStorage.setItem("slides", JSON.stringify(reordered))
  }

  return (
    <>
      <div className="flex w-64 flex-col rounded-xl border-2 bg-primary-200 p-3">
        <div className="mb-3 flex justify-between">
          <h2 className="text-lg font-medium">Slides</h2>
          <div className="flex gap-2">
            <button 
              className="rounded p-1 hover:bg-green-50" 
              onClick={onExport} 
              title="Export"
            >
              <ExportIcon width={16} />
            </button>
            <label className="cursor-pointer rounded p-1 hover:bg-green-50">
              <ImportIcon width={16} />
              <input 
                type="file" 
                onChange={onImport} 
                className="sr-only" 
                accept=".edslides,application/json" 
              />
            </label>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "relative rounded-md border-2 transition-all",
                            snapshot.isDragging 
                              ? "bg-green-100 shadow-lg border-primary-400" 
                              : "bg-white",
                            slide.id === currentSlide 
                              ? "border-primary-400" 
                              : "border-transparent"
                          )}
                        >
                          <div className="flex items-center gap-2 p-2" >
                            {/* Drag Handle */}
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:bg-gray-100 p-1 rounded"
                            >
                              <GripVertical className="h-4 w-4 text-gray-500" />
                            </div>
                            
                            {/* Slide Content */}
                            <div
                              onClick={() => onSlideChange(slide.id)}
                              className="flex-1 cursor-pointer"
                            >
                              <span className="font-medium">Slide {index + 1}</span>
                            </div>
                            
                            {/* Slide Controls (only show for current slide) */}
                            {slide.id === currentSlide && (
                              <div className="flex items-center gap-1">
                                <button
                                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMoveSlideUp()
                                  }}
                                  disabled={index === 0}
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onMoveSlideDown()
                                  }}
                                  disabled={index === slides.length - 1}
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-red-100 text-red-500 disabled:opacity-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteSlide()
                                  }}
                                  disabled={slides.length === 1}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="mt-3 border-t border-green-200 pt-3">
          <Button 
            onClick={() => setIsTypeSheetOpen(true)} 
            className="w-full gap-2 bg-primary-400 hover:bg-primary-500"
          >
            <span className="mr-1">+</span> Add Slide
          </Button>
        </div>
      </div>

      <SlideTypeSheet 
        open={isTypeSheetOpen} 
        onOpenChange={setIsTypeSheetOpen} 
        onSelectType={handleSelectSlideType} 
      />
    </>
  )
}