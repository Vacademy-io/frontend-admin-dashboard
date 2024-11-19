import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dateRangeFormSchema } from "../-utils/date-range-form-schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarBlank } from "phosphor-react";

export const DateRangeComponent = () => {
    const form = useForm<z.infer<typeof dateRangeFormSchema>>({
        resolver: zodResolver(dateRangeFormSchema),
        defaultValues: {
            startDate: "",
            endDate: "",
        },
        mode: "onChange", // Validate as user types
    });

    const { handleSubmit, watch } = form;

    const onSubmit = (data: z.infer<typeof dateRangeFormSchema>) => {
        console.log(data);
    };

    const onInvalid = (err: unknown) => {
        console.log(err);
    };

    // Watch form fields
    const startDate = watch("startDate");
    const endDate = watch("endDate");

    // Determine if all fields are filled
    const isFormValid = !!startDate && !!endDate;

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="outline" className="p-0 pl-2 pr-2">
                    <CalendarBlank size={32} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="!p-0">
                <h1 className="bg-primary-50 p-4 text-primary-500">Select Date Range</h1>
                <Form {...form}>
                    <form className="grid gap-4 p-4" onSubmit={handleSubmit(onSubmit, onInvalid)}>
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start justify-start gap-1">
                                    <FormLabel className="text-neutral-600">
                                        Enter Start Date
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            type="date"
                                            placeholder={"DD/MM/YYYY"}
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start justify-start gap-1">
                                    <FormLabel className="text-neutral-600">
                                        Enter End Date
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            value={field.value}
                                            onChange={field.onChange}
                                            type="date"
                                            placeholder={"DD/MM/YYYY"}
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="bg-primary-500 text-white"
                            disabled={!isFormValid}
                        >
                            Done
                        </Button>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    );
};
