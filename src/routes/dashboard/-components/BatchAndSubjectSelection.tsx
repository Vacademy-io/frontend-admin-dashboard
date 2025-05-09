"use client"

import { useState } from "react"
import { useForm, useFieldArray, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Trash2, Plus, Loader } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore"
import { useStudyLibraryQuery } from "@/routes/study-library/courses/-services/getStudyLibraryDetails"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getCourseSubjects } from "@/utils/helpers/study-library-helpers.ts/get-list-from-stores/getSubjects"
import { MultiSelect } from "@/components/design-system/multi-select"
import { inviteUsersSchema } from "./InviteUsersComponent"




export default function BatchSubjectForm() {
        const {instituteDetails,getDetailsFromPackageSessionId} = useInstituteDetailsStore();
        const {isLoading} = useSuspenseQuery(useStudyLibraryQuery())    
const form = useFormContext<z.infer<typeof inviteUsersSchema>>() 

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "batch_subject_mappings",
  })

  const [selectedBatches, setSelectedBatches] = useState<Record<number, string>>({})

  
  const Batches = instituteDetails?.batches_for_sessions?.map((batch) => ({
    id: batch.id,
    name: `${batch.level.level_name} ${" "} ${batch.package_dto.package_name}, ${batch.session.session_name}`,
  })) || [];


  const getSubjectsByBatchId = (batchId: string) => {
 
        const batch = getDetailsFromPackageSessionId({packageSessionId:batchId})
        const subjects = getCourseSubjects(batch?.package_dto?.id ?? "", batch?.session?.id ?? "",batch?.level?.id ?? "")
        return subjects.map((subject) => ({
            label: subject.subject_name,
            value: subject.id,
        }))
        
}

  if(isLoading) {
    return <Loader className="size-6 text-primary-500 animate-spin"/>
  }

  return (
    <Card className="w-full">
      <CardHeader className="py-4 px-2">
        <CardTitle> Select Batch and Subjects</CardTitle>
      </CardHeader>
          <CardContent className="space-y-4 p-2">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 p-2 border rounded-lg relative">
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={`batch_subject_mappings.${index}.batchId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Batch</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedBatches((prev) => ({ ...prev, [index]: value }))
                            // Reset subjects when batch changes
                            form.setValue(`batch_subject_mappings.${index}.subjectIds`, [])
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Batches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
{form.watch(`batch_subject_mappings.${index}.subjectIds`) && (

        <FormField
        control={form.control}
        name={`batch_subject_mappings.${index}.subjectIds`}
        render={({ field }) => (
                <FormItem>
                        <FormLabel>Select Subjects</FormLabel>
                        <FormControl>
                          <MultiSelect
                            selected={field.value}
                            options={getSubjectsByBatchId(selectedBatches[index] ?? "")}
                                onChange={field.onChange}
                                placeholder="Select subjects"
                                disabled={!selectedBatches[index]}
                                />
                        </FormControl>
                        <FormDescription>You can select multiple subjects for this batch</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                    />
                )}
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 right-0"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove batch</span>
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 hover:border-primary-500 hover:bg-white"
              onClick={() => append({ batchId: "", subjectIds: [] })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Batch
            </Button>
          </CardContent>
         
    </Card>
  )
}
