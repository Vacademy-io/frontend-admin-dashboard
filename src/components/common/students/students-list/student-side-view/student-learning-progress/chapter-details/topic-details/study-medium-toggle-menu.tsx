export const StudyMediumToggleMenu = ({
    menuOption,
    len,
    name,
}: {
    menuOption: string;
    len: number;
    name: string;
}) => {
    return (
        <div
            className={`flex h-10 w-[200px] items-center justify-center gap-[10px] rounded-lg px-4 py-[9px] ${
                menuOption === name ? "bg-white text-primary-500" : "bg-none text-neutral-600"
            }`}
        >
            <div>{name}</div>
            <div
                className={`flex size-6 items-center justify-center rounded-full bg-primary-500 text-caption text-neutral-50 ${
                    !len ? "hidden" : "visible"
                }`}
            >
                {len}
            </div>
        </div>
    );
};
