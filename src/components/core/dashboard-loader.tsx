import ClipLoader from "react-spinners/ClipLoader";
export function DashboardLoader({ height = "100vh" }: { height?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center`} style={{ height }}>
            <ClipLoader size={40} color="#ED7424" />
            <p>Loading...</p>
        </div>
    );
}
