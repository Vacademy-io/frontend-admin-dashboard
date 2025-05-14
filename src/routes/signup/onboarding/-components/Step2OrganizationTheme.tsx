import { MyButton } from "@/components/design-system/button";
import { OrganizationOnboardingProps } from "..";
import { useState } from "react"
import { HexColorPicker } from "react-colorful"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useTheme } from "@/providers/theme/theme-provider"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useOrganizationStore from "../-zustand-store/step1OrganizationZustand";

// Predefined themes with their base colors
const presetThemes = [
        { name: "Orange", color: "#ED7424" },
        { name: "Blue", color: "#1E88E5" },
        { name: "Green", color: "#43A047" },
        { name: "Purple", color: "#8E24AA" },
        { name: "Red", color: "#E53935" },
        { name: "Pink", color: "#D81B60" },
        { name: "Indigo", color: "#3949AB" },
        { name: "Yellow", color: "#FFB300" },
        { name: "Cyan", color: "#00ACC1" },
]

const organizationThemeSetup = z.object({
    instituteThemeCode: z.union([z.string(), z.undefined()]),
});

type FormValues = z.infer<typeof organizationThemeSetup>;

const Step2OrganizationTheme: React.FC<OrganizationOnboardingProps> = ({
        currentStep,
        handleCompleteCurrentStep,
        completedSteps,
}) => {

        const [selectedTheme, setSelectedTheme] = useState(presetThemes[0]?.color)
        const [customColor, setCustomColor] = useState("#ED7424");
           console.log(currentStep, completedSteps);
        const [openCustomDialog, setOpenCustomDialog] = useState(false);
          const { formData, setFormData } = useOrganizationStore();
         const form = useForm<FormValues>({
                resolver: zodResolver(organizationThemeSetup),
                defaultValues: {
                    instituteThemeCode: formData.instituteThemeCode ?? "",
                },
                mode: "onChange",
            });
        const { setPrimaryColor } = useTheme()

        // Generate color shades from a primary color
        const generateShades = (hexColor: string) => {
                // Convert hex to RGB
                const r = Number.parseInt(hexColor.slice(1, 3), 16)
                const g = Number.parseInt(hexColor.slice(3, 5), 16)
                const b = Number.parseInt(hexColor.slice(5, 7), 16)

                // Generate 5 shades (darker to lighter)
                const shades = [
                        // Original
                        hexColor,
                        `rgb(${Math.min(255, Math.floor(r + (255 - r) * 0.2))}, ${Math.min(255, Math.floor(g + (255 - g) * 0.2))}, ${Math.min(255, Math.floor(b + (255 - b) * 0.2))})`,
                        `rgb(${Math.min(255, Math.floor(r + (255 - r) * 0.4))}, ${Math.min(255, Math.floor(g + (255 - g) * 0.4))}, ${Math.min(255, Math.floor(b + (255 - b) * 0.4))})`,
                        `rgb(${Math.min(255, Math.floor(r + (255 - r) * 0.6))}, ${Math.min(255, Math.floor(g + (255 - g) * 0.6))}, ${Math.min(255, Math.floor(b + (255 - b) * 0.6))})`,
                        `rgb(${Math.min(255, Math.floor(r + (255 - r) * 0.8))}, ${Math.min(255, Math.floor(g + (255 - g) * 0.8))}, ${Math.min(255, Math.floor(b + (255 - b) * 0.8))})`,
                ]

                return shades
        }

        const handleThemeSelect = (color: string) => {
                setSelectedTheme(color)
                setPrimaryColor(color)
                setFormData({ ...formData, instituteThemeCode: color })
                form.setValue("instituteThemeCode", color)
        }

        const handleCustomColorSubmit = () => {
                setSelectedTheme(customColor)
                setPrimaryColor(customColor)
                setFormData({ ...formData, instituteThemeCode: customColor })
                form.setValue("instituteThemeCode", customColor)
                setOpenCustomDialog(false)
        }

        return (
                <div className="my-6 flex flex-col items-center justify-center gap-4  w-3/4 p-4">
                                               <h1 className="text-[1.6rem] mb-4">Set your organization theme</h1>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-2 w-full">
                                        {presetThemes.map((theme) => {
                                                const shades = generateShades(theme.color)
                                                return (
                                                        <div
                                                                key={theme.name}
                                                                role="button"
                                                                onClick={() => handleThemeSelect(theme.color)}
                                                                className={cn(
                                                                        "rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow",
                                                                        selectedTheme === theme.color ? "ring-2 ring-offset-2 ring-primary-500" : "ring-1 ring-gray-200",
                                                                )}
                                                                aria-label={`Select ${theme.name} theme`}
                                                        >
                                                                <div className="flex flex-col">
                                                                        {shades.map((shade, index) => (
                                                                                <div key={index} className="h-7" style={{ backgroundColor: shade }} />
                                                                        ))}
                                                                </div>
                                                        </div>
                                                )
                                        })}
                                </div>

                                <Dialog open={openCustomDialog} onOpenChange={setOpenCustomDialog}>
                                        <DialogTrigger asChild>
                                                <button className="text-primary-400 hover:text-primary-500 font-medium mb-8">Custom Color</button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                        <DialogTitle>Custom Theme</DialogTitle>
                                                </DialogHeader>
                                                <Tabs defaultValue="picker" className="mt-4 w-full">
                                                        <TabsList className="grid w-full grid-cols-2">
                                                                <TabsTrigger value="picker">Color Picker</TabsTrigger>
                                                                <TabsTrigger value="hex">Hex Code</TabsTrigger>
                                                        </TabsList>
                                                        <TabsContent value="picker" className="py-4 w-full">
                                                                <HexColorPicker
                                                                        color={customColor}
                                                                        onChange={(color) => {
                                                                                setCustomColor(color)
                                                                        }}
                                                                        className="w-full "
                                                                />
                                                        </TabsContent>
                                                        <TabsContent value="hex" className="py-4">
                                                                <div className="flex items-center gap-2">
                                                                        <Input
                                                                                value={customColor}
                                                                                onChange={(e) => {
                                                                                        // Validate hex code format
                                                                                        const hex = e.target.value
                                                                                        if (hex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                                                                                                setCustomColor(hex)
                                                                                        } else if (hex.match(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
                                                                                                setCustomColor(`#${hex}`)
                                                                                        } else if (hex.startsWith("#") && hex.length <= 7) {
                                                                                                setCustomColor(hex)
                                                                                        } else if (hex.length <= 6) {
                                                                                                setCustomColor(`#${hex}`)
                                                                                        }
                                                                                }}
                                                                                placeholder="#RRGGBB"
                                                                        />
                                                                        <div className="w-10 h-10 rounded-md border border-gray-200" style={{ backgroundColor: customColor }} />
                                                                </div>
                                                        </TabsContent>
                                                </Tabs>
                                                <div className="mt-4">
                                                        <h3 className="text-sm font-medium mb-2">Preview</h3>
                                                        <div className="rounded-lg overflow-hidden">
                                                                {generateShades(customColor).map((shade, index) => (
                                                                        <div key={index} className="h-8" style={{ backgroundColor: shade }} />
                                                                ))}
                                                        </div>
                                                </div>
                                                <div className="flex justify-end mt-4">
                                                        <Button style={{ color: customColor, border: `1px solid ${customColor}` }} onClick={handleCustomColorSubmit}>Apply</Button>
                                                </div>
                                        </DialogContent>
                                </Dialog>
                      
                        <MyButton
                                type="button"
                                scale="large"
                                buttonType="primary"
                                layoutVariant="default"
                                onClick={() => {
                                        handleCompleteCurrentStep()
                                        console.log("Theme selected:", selectedTheme)
                                }}
                                className="mt-4"

                        >
                                Continue
                        </MyButton>
                </div>
        );
}

export default Step2OrganizationTheme;
