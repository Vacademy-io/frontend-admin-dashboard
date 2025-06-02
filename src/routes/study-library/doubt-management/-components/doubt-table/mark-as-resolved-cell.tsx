import { MarkAsResolved } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/MarkAsResolved";
import { Doubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type";
import { useState, useRef, useEffect } from "react";
import { CaretDown } from "phosphor-react";
import { getUserId, isUserAdmin } from "@/utils/userDetails";

export const MarkResolutionDropdown = ({resolved, handleDoubtResolve, doubt}: {resolved: boolean, handleDoubtResolve: (value: boolean) => void, doubt: Doubt}) => {
    const isAdmin = isUserAdmin();
    const userId = getUserId();
    const canResolve = isAdmin || doubt.all_doubt_assignee.some(assignee => assignee.id==userId);

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        canResolve ?
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className={`py-1 px-2 rounded-xl border flex items-center gap-1 font-semibold text-caption cursor-pointer ${
                    resolved
                        ? "bg-green-50 text-green-700 border-success-500"
                        : "bg-red-50 text-red-700 border-danger-500"
                }`}
            >
                {resolved ? "Resolved" : "Unresolved"} <span className="text-caption"><CaretDown /></span>
            </button>
            {open && (
                <div className="absolute top-[110%] left-0 bg-white shadow-md rounded-lg min-w-[120px] z-50">
                    <div
                        onClick={() => { setOpen(false); if (resolved) handleDoubtResolve(false); }}
                        className={` py-2 w-full text-center rounded-lg hover:bg-neutral-50 ${!resolved?"bg-danger-100 text-danger-700":"bg-white text-neutral-600"} ${resolved ? "cursor-pointer" : "cursor-default"}`}
                    >
                        Unresolved
                    </div>
                    <div
                        onClick={() => { setOpen(false); if (!resolved) handleDoubtResolve(true); }}
                        className={`py-2 w-full text-center  rounded-lg ${
                            resolved
                                ? "bg-green-50 font-semibold text-success-700"
                                : "hover:bg-gray-50"
                        } ${!resolved ? "cursor-pointer" : "cursor-default"}`}
                    >
                        Resolved
                    </div>
                </div>
            )}
        </div>
        :
        <button
                onClick={() => setOpen((prev) => !prev)}
                className={`py-1 px-2 rounded-xl border flex items-center gap-1 font-semibold text-caption cursor-pointer ${
                    resolved
                        ? "bg-green-50 text-green-700 border-success-500"
                        : "bg-red-50 text-red-700 border-danger-500"
                }`}
            >
                {resolved ? "Resolved" : "Unresolved"}
        </button>
    );
}

export const MarkAsResolvedCell = ({doubt, refetch}: {doubt: Doubt, refetch: () => void}) => {
    return(
        <MarkAsResolved doubt={doubt} refetch={refetch} />
    )
}