import ClipLoader from "react-spinners/ClipLoader";
export function DashboardLoader({
    height = "100vh",
    size = 40,
}: {
    height?: string;
    size?: number;
}) {
    return (
        <div className={`flex flex-col items-center justify-center`} style={{ height }}>
            <ClipLoader size={size} color="#ED7424" />
        </div>
    );
}
