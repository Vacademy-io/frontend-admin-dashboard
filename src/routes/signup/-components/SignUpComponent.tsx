import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { VacademyAssessLogo, VacademyLMSLogo, VacademyLogo } from "@/svgs";
import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";
import { useNavigate } from "@tanstack/react-router";

const items = [
    {
        id: "assess",
        label: "Assess",
    },
    {
        id: "lms",
        label: "LMS",
    },
] as const;

const FormSchema = z.object({
    items: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
    }),
});

export function SignUpComponent() {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            items: ["recents", "home"],
        },
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(data);
    }

    return (
        <div className="flex w-full">
            <div className="flex w-1/2 flex-col items-center justify-center bg-primary-50">
                <VacademyLogo />
            </div>
            <div className="flex w-1/2 items-center justify-center">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-[350px] flex-col items-center justify-center space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="items"
                            render={() => (
                                <FormItem>
                                    <div className="mb-10">
                                        <FormLabel className="text-[1.5rem]">
                                            Evaluate smarter, learn better
                                        </FormLabel>
                                        <FormDescription className="text-center">
                                            Redefining Education with Insightful Tools for Smarter
                                            Evaluations and Better Learning Outcomes.
                                        </FormDescription>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        <h1>Choose your preferred solutions</h1>
                                        <div className="my-4 flex w-[300px] flex-col gap-4">
                                            {items.map((item) => (
                                                <FormField
                                                    key={item.id}
                                                    control={form.control}
                                                    name="items"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={item.id}
                                                                className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border bg-neutral-50 p-2"
                                                            >
                                                                <FormLabel className="text-sm font-normal">
                                                                    {item.label === "Assess" && (
                                                                        <VacademyAssessLogo />
                                                                    )}
                                                                    {item.label === "LMS" && (
                                                                        <VacademyLMSLogo />
                                                                    )}
                                                                </FormLabel>
                                                                <FormControl className="flex items-center justify-center">
                                                                    <Checkbox
                                                                        checked={field.value?.includes(
                                                                            item.id,
                                                                        )}
                                                                        onCheckedChange={(
                                                                            checked,
                                                                        ) => {
                                                                            return checked
                                                                                ? field.onChange([
                                                                                      ...field.value,
                                                                                      item.id,
                                                                                  ])
                                                                                : field.onChange(
                                                                                      field.value?.filter(
                                                                                          (value) =>
                                                                                              value !==
                                                                                              item.id,
                                                                                      ),
                                                                                  );
                                                                        }}
                                                                        className={`mt-1 size-5 border shadow-none ${
                                                                            field.value.includes(
                                                                                item.id,
                                                                            )
                                                                                ? "border-none bg-green-500 text-white" // Blue background and red tick when checked
                                                                                : "bg-white" // Default styles when unchecked
                                                                        }`}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <MyButton
                            type="submit"
                            scale="large"
                            buttonType="primary"
                            layoutVariant="default"
                            onClick={() => navigate({ to: "/signup/onboarding" })}
                        >
                            <Plus size={32} />
                            Create Free Account
                        </MyButton>
                        <p className="text-sm text-neutral-500">
                            Already have an account?{" "}
                            <span
                                className="cursor-pointer text-primary-500"
                                onClick={() => navigate({ to: "/login" })}
                            >
                                Login
                            </span>
                        </p>
                    </form>
                </Form>
            </div>
        </div>
    );
}
