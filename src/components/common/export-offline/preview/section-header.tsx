interface SectionHeaderProps {
    title: string;
    description: string;
    totalMarks: number;
    duration: number;
    showDuration?: boolean;
    showMarks?: boolean;
}

export function SectionHeader({
    title,
    description,
    totalMarks,
    duration,
    showDuration = true,
    showMarks = true,
}: SectionHeaderProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">{title}</h2>

                <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    {showMarks && <div>Section-wise Marks: {totalMarks} Marks</div>}
                    {showDuration && <div>Section-wise Duration: {duration} Mins</div>}
                </div>
            </div>

            {description && <p className="text-gray-600">{description}</p>}
        </div>
    );
}
