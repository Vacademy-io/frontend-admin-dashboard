"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useLoaderStore } from "../-hooks/loader"

export interface StudentData {
  name: string
  enrollId: string
  pdfId: string
  fileId?: string
}

interface StudentSelectionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (selectedStudents: StudentData[], selectedAssessment?: string) => void
  title?: string
  students?: StudentData[]
  itemsPerPage?: number
  assessments?: {assessmentId: string, title: string}[]
}

export function StudentSelectionDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  title = "Select Students for Evaluation",
  students = [],
  itemsPerPage = 5,
  assessments = []
}: StudentSelectionDialogProps) {
  const [selected, setSelected] = useState<number[]>([])
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [isEvaluating, setIsEvaluating] = useState(false)

    const {  setLoading } = useLoaderStore();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = Math.ceil(students.length / itemsPerPage)
  const paginatedStudents = students.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (isOpen) {
      setSelected([])
      setCurrentPage(1)
      setSelectedAssessment("")
    }
  }, [isOpen])

  const toggleSelect = (index: number) => {
    setSelected((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndices = paginatedStudents.map((_, index) => (currentPage - 1) * itemsPerPage + index)
      setSelected(allIndices)
    } else {
      setSelected([])
    }
  }

  const handleOpenAssessmentModal = () => {
    if (selected.length === 0) {
      toast.warning("Please select at least one student")
      return
    }
    setIsAssessmentModalOpen(true)
  }

  const handleEvaluate = async () => {
    if (!selectedAssessment) {
      toast.warning("Please select an assessment")
      return
    }
    setIsEvaluating(true)
    try {
      const selectedStudents = selected.map((index) => students[index]) ?? []
       setLoading(true)
      onSubmit(selectedStudents, selectedAssessment)
      
    } catch (error) {
      toast.error("Evaluation failed. Please try again.")
    } finally {
     
      setIsEvaluating(false)
      setIsAssessmentModalOpen(false)
      onOpenChange(false)
    }
  }

  const goToPage = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[60vw]">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-bold">{"Select Students for Evaluation"}</DialogTitle>
          </DialogHeader>
          <div className="mx-auto w-full max-w-4xl mb-4">
            <div className="mt-4 rounded-md border">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary-50">
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 w-12 bg-primary-50 text-center">
                        <Checkbox
                          checked={paginatedStudents.length > 0 && selected.length === paginatedStudents.length}
                          onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        />
                      </TableHead>
                      <TableHead className="sticky left-12 z-10 bg-primary-50">Student Name</TableHead>
                      <TableHead>Enrollment ID</TableHead>
                      <TableHead>PDF ID</TableHead>
                      <TableHead>File ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isEvaluating ? (
                      // Shimmer loading effect
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell className="sticky left-0 z-10 bg-white text-center">
                              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                            </TableCell>
                            <TableCell className="sticky left-12 z-10 bg-white">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Evaluating students with {selectedAssessment}...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      // Normal student rows
                      paginatedStudents.map((student, index) => {
                        const actualIndex = (currentPage - 1) * itemsPerPage + index
                        return (
                          <TableRow key={index}>
                            <TableCell className="sticky left-0 z-10 bg-white text-center">
                              <Checkbox
                                checked={selected.includes(actualIndex)}
                                onCheckedChange={() => toggleSelect(actualIndex)}
                              />
                            </TableCell>
                            <TableCell className="sticky left-12 z-10 bg-white">{student.name}</TableCell>
                            <TableCell>{student.enrollId}</TableCell>
                            <TableCell>{student.pdfId}</TableCell>
                            <TableCell>{student.fileId || "N/A"}</TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {students.length === 0 && !isEvaluating ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No enrolled students found.</div>
              ) : (
                !isEvaluating && (
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground mr-2">{selected.length} selected</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenAssessmentModal} disabled={selected.length === 0 || isEvaluating}>
              Submit Selected ({selected.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Selection Dialog */}
      <Dialog open={isAssessmentModalOpen} onOpenChange={setIsAssessmentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-bold">Select Assessment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assessment" className="text-right">
                Assessment
              </Label>
              <Select onValueChange={(value) => setSelectedAssessment(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an assessment" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((assessment) => (
                    <SelectItem key={assessment.assessmentId} value={assessment.assessmentId}>
                      {assessment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssessmentModalOpen(false)} disabled={isEvaluating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEvaluate} disabled={!selectedAssessment || isEvaluating}>
              {isEvaluating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Evaluate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}