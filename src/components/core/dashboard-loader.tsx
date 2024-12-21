import ClipLoader from "react-spinners/ClipLoader";
export function DashboardLoader() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <ClipLoader size={40} color="#ED7424" />
            <p>Loading...</p>
        </div>
    );
}
