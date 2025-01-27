export function convertToLocalDateTime(utcDate: string): string {
    const date = new Date(utcDate);

    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    };

    const formattedDate = date.toLocaleString("en-GB", options);
    return formattedDate.replace(",", "").replace(/\s(am|pm)/i, (match) => match.toUpperCase());
}
