/* eslint-disable */
// @ts-nocheck
"use client"

import React, { useState } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ExportIcon, ImportIcon } from "./Icons"
import { SlideTypeSheet } from "./slideTypeSheet"
import {
  GripVertical,
  QrCode,
  Youtube,
  Link2,
  FileQuestion,
  MessageSquare,
  Presentation,
  Trash2,
} from "lucide-react"
import type { Slide } from "./types"
import type { SlideType } from "./constant/slideType"
import { SlideType as SlideTypeEnum } from "./constant/slideType"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SlideListProps {
  slides: Slide[]
  currentSlide: string | undefined
  onSlideChange: (id: string) => void
  onAddSlide: (type: SlideType) => void
  onMoveSlideUp: () => void
  onMoveSlideDown: () => void
  onDeleteSlide: (id: string) => void // Changed to accept slide ID
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onReorderSlides: (newSlides: Slide[]) => void
}

interface PreviewProps {
  type: SlideType
}

export function SlideTypePreview({ type }: PreviewProps) {
  switch (type) {
    case SlideTypeEnum.TextMedia:
      return (
        <div className="relative h-12 w-full rounded-md bg-gray-200">
          <div className="h-2 w-3/4 bg-gray-300 rounded mt-2 mx-2"></div>
          <div className="absolute right-2 top-2 h-8 w-8 bg-gray-300 rounded flex items-center justify-center">
            <QrCode className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )
    case SlideTypeEnum.FullscreenMedia:
      return <Youtube className="h-8 w-8 text-gray-500" />
    case SlideTypeEnum.WebLink:
      return <Link2 className="h-8 w-8 text-gray-500" />
    case SlideTypeEnum.Quiz:
      return <FileQuestion className="h-8 w-8 text-gray-500"/>
    case SlideTypeEnum.Feedback:
      return <MessageSquare className="h-8 w-8 text-gray-500"/>
    case SlideTypeEnum.Presentation:
      return <Presentation className="h-8 w-8 text-gray-500" />
    case SlideTypeEnum.Title:
      return (
        <div className="h-12 w-full rounded-md bg-gray-200 flex flex-col justify-center">
          <div className="mx-auto h-2 w-3/4 bg-gray-300 rounded"></div>
        </div>
      )
    case SlideTypeEnum.Text:
      return (
        <div className="h-12 w-full rounded-md bg-gray-200 flex flex-col justify-between py-2">
          <div className="h-2 w-full bg-gray-300 rounded" />
          <div className="h-2 w-full bg-gray-300 rounded" />
        </div>
      )
    case SlideTypeEnum.Blank:
    default:
      return <div className="h-12 w-full rounded-md bg-gray-200" />
  }
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
    if (!result.destination) return

    const reordered = Array.from(slides)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    onReorderSlides(reordered)
    localStorage.setItem("slides", JSON.stringify(reordered))
  }

  return (
    <>
      <div className="flex w-48 flex-col rounded-xl bg-primary-200 p-3">
        <div className="pt-3">
          <Button
            onClick={() => setIsTypeSheetOpen(true)}
            className="w-full gap-2 bg-primary-400 hover:bg-primary-500"
          >
            <span className="mr-1">+</span> Add Slide
          </Button>
        </div>

        <Separator className="my-3" />

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

        <div className="flex-1">
          <ScrollArea className="h-[72vh] rounded-md overflow-auto">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="slides">
                {(provided) => (
                  <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2 p-2"
                  >
                    {slides.map((slide, index) => (
                      <Draggable
                        key={slide.id}
                        draggableId={slide.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "group relative rounded-md border-2 transition-all",
                              snapshot.isDragging
                                ? "bg-green-100 shadow-lg border-primary-400"
                                : "bg-white",
                              slide.id === currentSlide
                                ? "border-primary-400"
                                : "border-transparent hover:border-gray-200"
                            )}
                            onClick={() => onSlideChange(slide.id)}
                          >
                            <SlideTypePreview type={slide.type} />
                            <div className="flex items-center justify-between p-2">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab hover:bg-gray-100 p-1 rounded"
                              >
                                <GripVertical className="h-4 w-4 text-gray-500" />
                              </div>
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 hover:text-red-500"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteSlide(slide.id)
                                }}
                                title="Delete slide"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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
          </ScrollArea>
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