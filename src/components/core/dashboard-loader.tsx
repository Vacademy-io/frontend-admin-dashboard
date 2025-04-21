import { cn } from "@/lib/utils";
import ClipLoader from "react-spinners/ClipLoader";
export function DashboardLoader({
    height = "100vh",
    size = 40,
    color = "#ED7424",
    className = "",
}: {
    height?: string;
    size?: number;
    color?: string;
    className?: string;
}) {
    return (
        <div
            className={cn(`flex flex-col items-center justify-center`, className)}
            style={{ height }}
        >
            <ClipLoader size={size} color={color} />
        </div>
    );
}
