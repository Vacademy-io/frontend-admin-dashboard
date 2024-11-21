import { MySidebar } from "./sidebar/mySidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { Navbar } from "./top-navbar.tsx/navbar";
import { cn } from "@/lib/utils";

export const LayoutContainer = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const { open } = useSidebar();
    return (
        <div className={`flex w-full ${open ? "gap-8" : "gap-16"}`}>
            <div>
                <MySidebar />
            </div>

            <div className="w-full">
                <Navbar />
                <div className={cn("m-8", className)}>{children}</div>
            </div>
        </div>
    );
};
