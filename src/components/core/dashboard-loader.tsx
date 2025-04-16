import ClipLoader from "react-spinners/ClipLoader";
export function DashboardLoader({
    height = "100vh",
    size = 40,
    color = "#ED7424",
}: {
    height?: string;
    size?: number;
    color?: string;
}) {
    return (
        <div className={`flex flex-col items-center justify-center`} style={{ height }}>
            <ClipLoader size={size} color={color} />
        </div>
    );
}
