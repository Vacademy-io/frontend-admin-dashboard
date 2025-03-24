"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, Youtube, Link2, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileQuestion, GraduationCap, MessageSquare, Presentation } from "lucide-react";
export type SlideType =
  | "blank"
  | "title"
  | "text"
  | "text-media"
  | "fullscreen-media"
  | "web-link"
  | "interactive-video"

interface SlideTypeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectType: (type: SlideType) => void
}

export function SlideTypeSheet({ open, onOpenChange, onSelectType }: SlideTypeSheetProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const slideTypes = [
    { id: "blank", name: "Blank slide", icon: null },
    { id: "title", name: "Title Slide", icon: null },
    { id: "text", name: "Text Slide", icon: null },
    { id: "text-media", name: "Text and media", icon: <QrCode className="h-6 w-6 text-gray-500" /> },
    { id: "fullscreen-media", name: "Fullscreen media", icon: <Youtube className="h-6 w-6 text-gray-500" /> },
    { id: "web-link", name: "Web page link", icon: <Link2 className="h-6 w-6 text-gray-500" /> },
   
    { id: "presentation", name: "Presentation", icon: <Presentation className="mr-2 h-4 w-4" /> },
    { id: "quiz", name: "Quiz", icon: <FileQuestion className="mr-2 h-4 w-4" /> },
    { id: "lms", name: "LMS", icon: <GraduationCap className="mr-2 h-4 w-4" /> },
    { id: "feedback", name: "Feedback", icon: <MessageSquare className="mr-2 h-4 w-4" /> , isNew: true, },
    {
      id: "interactive-video",
      name: "Interactive Video",
      icon: <Youtube className="h-6 w-6 text-gray-500" />,
      isNew: true,
    },
  ]

  const filteredSlideTypes = slideTypes.filter((type) => type.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Sheet open={open} onOpenChange={onOpenChange} >
      <SheetContent className="w-[350px] sm:w-[400px] overflow-y-auto bg-primary-200" side="left">
        <SheetHeader>
          <SheetTitle className="text-xl">Slect Slide</SheetTitle>
        </SheetHeader>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search on teleport"
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <h3 className="mt-6 mb-3 text-gray-700">Select slide type</h3>

          <div className="grid grid-cols-2 gap-3">
            {filteredSlideTypes.map((type) => (
              <div
                key={type.id}
                className="relative cursor-pointer rounded-md border border-primary-300 p-3 hover:border-primary-400 hover:bg-primary-300"
                onClick={() => onSelectType(type.id as SlideType)}
              >
                <div className="flex h-16 flex-col items-center justify-center">
                  {type.icon ? (
                    type.icon
                  ) : (
                    <div
                      className={cn(
                        "h-12 w-full rounded-md bg-gray-200",
                        type.id === "title" && "flex flex-col justify-center",
                        type.id === "text" && "flex flex-col justify-between",
                      )}
                    >
                      {type.id === "title" && <div className="mx-auto h-2 w-3/4 bg-gray-300 rounded"></div>}
                      {type.id === "text" && (
                        <>
                          <div className="h-2 w-full bg-gray-300 rounded mt-2"></div>
                          <div className="h-2 w-full bg-gray-300 rounded mb-2"></div>
                        </>
                      )}
                      {type.id === "text-media" && (
                        <>
                          <div className="h-2 w-3/4 bg-gray-300 rounded mt-2"></div>
                          <div className="absolute right-6 top-8 h-8 w-8 bg-gray-300 rounded flex items-center justify-center">
                            <QrCode className="h-4 w-4 text-gray-400" />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-center text-sm">{type.name}</p>
                {type.isNew && (
                  <span className="absolute -top-2 -left-2 rounded-full bg-purple-500 px-2 py-0.5 text-xs text-white">
                    New
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

