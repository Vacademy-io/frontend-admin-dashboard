import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isNullOrEmptyOrUndefined<T>(
    value: T | null | undefined,
): value is null | undefined {
    return value === null || value === undefined || (typeof value === "string" && value === "");
}

export function convertCapitalToTitleCase(str: string) {
    // Split the text into words
    const words = str?.split(" ");

    // Capitalize the first letter of each word and convert the rest to lowercase
    const titleCaseWords = words?.map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );

    // Join the words back into a string
    const titleCaseText = titleCaseWords?.join(" ");

    return titleCaseText;
}
