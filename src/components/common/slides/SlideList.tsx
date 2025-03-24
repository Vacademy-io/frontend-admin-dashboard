"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ExportIcon, ImportIcon } from "./Icons"
import type { Slide } from "./types"
import { SlideTypeSheet ,type SlideType} from "./slideTypeSheet"


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
}: SlideListProps) {
  const [isTypeSheetOpen, setIsTypeSheetOpen] = useState(false)

  const handleSelectSlideType = (type: SlideType) => {
    onAddSlide(type)
    setIsTypeSheetOpen(false)
  }

  return (
    <>
      <div className="flex w-64 flex-col rounded-xl border-2 bg-primary-200 p-3">
        <div className="mb-3 flex justify-between">
          <h2 className="text-lg font-medium">Slides</h2>
          <div className="flex gap-2">
            <button className="rounded p-1 hover:bg-green-50" onClick={onExport} title="Export">
              <ExportIcon width={16} />
            </button>
            <label className="cursor-pointer rounded p-1 hover:bg-green-50">
              <ImportIcon width={16} />
              <input type="file" onChange={onImport} className="sr-only" accept=".edslides,application/json" />
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
                    slide.id === currentSlide ? "bg-green-50 bg-primary-300" : "border-primary-200",
                  )}
                  onClick={() => onSlideChange(slide.id)}
                >
                  <span className="font-medium">Slide {index + 1}</span>

                  {slide.id === currentSlide && (
                    <div className="flex items-center gap-1">
                      <button
                        className="size-6 rounded hover:bg-green-100"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveSlideUp()
                        }}
                        title="Move Up"
                      >
                        ↑
                      </button>

                      <button
                        className="size-6 rounded hover:bg-green-100"
                        disabled={index === slides.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          onMoveSlideDown()
                        }}
                        title="Move Down"
                      >
                        ↓
                      </button>

                      <button
                        className="size-6 rounded hover:bg-green-100"
                        disabled={slides.length === 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteSlide()
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
          <Button onClick={() => setIsTypeSheetOpen(true)} className="w-full gap-2 bg-primary-400">
            <span className="mr-1">+</span> Add Slide
          </Button>
        </div>
      </div>

      <SlideTypeSheet open={isTypeSheetOpen} onOpenChange={setIsTypeSheetOpen} onSelectType={handleSelectSlideType} />
    </>
  )
}

