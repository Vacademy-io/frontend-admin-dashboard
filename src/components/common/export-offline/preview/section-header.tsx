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
        <div className="mb-4 space-y-4">
            <div className="border-b pb-2">
                <h2 className="text-center text-lg font-semibold">{title}</h2>

                <div className="flex items-center justify-between text-sm text-gray-600">
                    {showMarks && <div>Marks: {totalMarks}</div>}
                    {showDuration && (
                        <div>
                            Duration:{" "}
                            {duration % 60 === 0 ? `${duration / 60} Hrs` : `${duration} Mins`}
                        </div>
                    )}
                </div>
                {description && <p className="text-gray-600">{description}</p>}
            </div>
        </div>
    );
}
