export const FormStepHeading = ({
    stepNumber,
    heading,
}: {
    stepNumber: number;
    heading: string;
}) => {
    return (
        <div className="flex w-full gap-3">
            <div className="text-subtitle">step {stepNumber}</div>
            <div className="text-h3 font-semibold">{heading}</div>
        </div>
    );
};
