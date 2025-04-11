"use client"

import { useNavHeadingStore } from "@/stores/layout-container/useNavHeadingStore"
import { useEffect, useState } from "react"

import { DashboardLoader } from "@/components/core/dashboard-loader"
import { useSelectedSessionStore } from "@/stores/study-library/selected-session-store"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Edit, FileIcon as FilePresentation, Plus, Search, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "@tanstack/react-router";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Presentation, useGetPresntation } from "./hooks/useGetPresntation"



export const ManagePresentation = () => {
 const router = useRouter()
  const { setNavHeading } = useNavHeadingStore()

  const { selectedSession, setSelectedSession } = useSelectedSessionStore()

 
  const { data, isLoading, isError } = useGetPresntation()

  const [presentations, setPresentations] = useState<Presentation[]>(data ??[])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")



  const handleDeletePresentation = (id: string) => {
    setPresentations(presentations.filter((presentation) => presentation.id !== id))
  }

  const handleEditPresentation = (id: string) => {
    // Implement edit functionality
   router.navigate({ to:    `/study-library/present/add?id=${id}`})
    console.log("Editing presentation:", id)
  }

  const filteredPresentations = presentations.filter((presentation) => {
    // Filter by search query
    const matchesSearch =
      presentation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      presentation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (presentation.category && presentation.category.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by tab
    if (activeTab === "all") return matchesSearch
    if (activeTab === "published") return matchesSearch && presentation.status === "published"
    if (activeTab === "drafts") return matchesSearch && presentation.status === "draft"
    if (activeTab === "archived") return matchesSearch && presentation.status === "archived"

    return matchesSearch
  })

  useEffect(() => {
    setPresentations(data ??[])
  }, [data])

  useEffect(() => {
    setNavHeading("Manage Presentation")
  }, [])

  if (isLoading) return <DashboardLoader />

  if (isError) return <p>Unable to fetch batches</p>

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-amber-100 text-amber-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex flex-col gap-8 text-neutral-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Presentations</h1> 
          <p className="text-sm text-neutral-500 mt-1">Manage and organize your presentation materials</p>
        </div>
        <Button className="bg-rose-600 hover:bg-rose-700 text-white self-start md:self-center" onClick={() => router.navigate({ to:    `/study-library/present/add`})}>
          <Plus className="h-4 w-4 mr-2" /> New Presentation
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs> */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search presentations..."
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredPresentations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresentations.map((presentation) => (
            <Card
              key={presentation.id}
              className="overflow-hidden border border-neutral-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-2 w-full bg-gradient-to-r from-primary-300"></div>
              <CardHeader className="pb-2 pt-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Badge className={cn("mb-2 font-normal", getStatusColor(presentation.status))}>
                      {presentation.status.charAt(0).toUpperCase() + presentation.status.slice(1)}
                    </Badge>
                    <h3 className="text-lg font-semibold line-clamp-1">{presentation.title}</h3>
                    {presentation.category && <span className="text-xs text-neutral-500">{presentation.category}</span>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 line-clamp-2 min-h-[40px]">{presentation.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="bg-neutral-50 text-xs font-normal">
                    {presentation.slides} slides
                  </Badge>
                  {presentation.lastEdited && (
                    <Badge variant="outline" className="bg-neutral-50 text-xs font-normal">
                      Edited {new Date(presentation.lastEdited).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-3 pb-4 border-t border-neutral-100">
                <span className="text-xs text-neutral-400">
                  Created {new Date(presentation.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                    onClick={() => handleEditPresentation(presentation.id)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePresentation(presentation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-neutral-300 rounded-lg bg-neutral-50">
          <FilePresentation className="h-12 w-12 text-neutral-300 mb-4" />
          <h3 className="text-lg font-medium text-neutral-700">No presentations found</h3>
          <p className="text-neutral-500 text-center max-w-md mt-1">
            {searchQuery
              ? `No presentations match your search "${searchQuery}". Try a different search term.`
              : "Get started by creating your first presentation."}
          </p>
          {searchQuery && (
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
