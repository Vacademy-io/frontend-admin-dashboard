import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MyButtonProps } from "./utils/types/button-types";

// Button Variants Configuration
const myButtonVariants = {
    base: "font-normal focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed transition-colors text-subtitle font-semibold shadow-none active:outline-none ",
    types: {
        primary:
            "bg-primary-500 !text-neutral-50 font-semibold hover:bg-primary-400 active:bg-[#be5d1d] disabled:bg-[#fad5bd] ",
        secondary:
            "bg-white font-regular border-neutral-300 border !text-neutral-600 hover:border-primary-300 hover:bg-[#fef7ee] active:border-primary-500 active:bg-[#fdedd7] disabled:text-[#7f7f7f] disabled:bg-white disabled:border-neutral-200",
        text: "shadow-none bg-transparent text-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:text-neutral-300 disabled:bg-transparent",
    },
    textStyles: {
        large: "text-subtitle font-regular",
        medium: "text-body font-regular",
        small: "text-caption font-regular",
    },
    scales: {
        default: {
            large: "w-60 h-10 px-4 text-subtitle ",
            medium: "w-[140px] h-9 px-3 text-body ",
            small: "w-[83px] h-6 px-2 text-caption",
        },
        icon: {
            large: "w-10 h-10 !p-0",
            medium: "w-9 h-9 !p-0",
            small: "w-6 h-6 !p-0",
        },
        floating: {
            large: "w-24 h-24 rounded-full",
            medium: "w-14 h-14 rounded-full",
            small: "w-10 h-10 rounded-full",
        },
        extendedFloating: {
            large: "w-24 h-24 rounded-full",
            medium: "w-24 h-14 rounded-full px-4",
            small: "w-[71px] h-10 rounded-full px-3",
        },
    },
} as const;

// Button Component
export const MyButton = ({
    className,
    buttonType = "primary",
    scale = "medium",
    layoutVariant = "default",
    children,
    ...props
}: MyButtonProps) => {
    const getButtonClasses = () => {
        // Create an array of classes
        const classes: string[] = [
            myButtonVariants.base,
            myButtonVariants.types[buttonType],
            myButtonVariants.scales[layoutVariant][scale],
        ];

        // Add text-specific styles only for text type buttons
        if (buttonType === "text") {
            classes.push(myButtonVariants.textStyles[scale]);
        }

        return classes.join(" ");
    };

    return (
        <Button className={cn(getButtonClasses(), className)} {...props}>
            {children}
        </Button>
    );
};

// Usage Examples:
/*
// Primary button
<MyButton 
    buttonType="primary" 
    scale="large" 
    layoutVariant="default"
    onClick={() => console.log('clicked')}
>
    Click Me
</MyButton>

// Text variant
<MyButton 
    buttonType="text" 
    scale="medium"
>
    Text Button
</MyButton>

// Icon button
<MyButton 
    layoutVariant="icon" 
    scale="small"
>
    <IconComponent />
</MyButton>
*/
