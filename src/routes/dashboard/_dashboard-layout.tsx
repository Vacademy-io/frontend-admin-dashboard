import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { FaRegCircleUser } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { LuSettings } from "react-icons/lu";
import { MdComputer, MdSpaceDashboard } from "react-icons/md";
import { RiArrowDownSFill } from "react-icons/ri";

export const Route = createFileRoute("/dashboard/_dashboard-layout")({
    component: DashboardLayout,
});

function DashboardLayout() {
    return (
        <div className="flex h-screen flex-col">
            <header className="bg-base-secondary sticky top-0 z-30 flex h-14 select-none items-center gap-1 px-4 ring-1 ring-gray-100/30 dark:ring-gray-900">
                <Button
                    variant="default"
                    size="icon"
                    aria-label="Home"
                    className="bg-transparent !shadow-none"
                >
                    <BsGlobeCentralSouthAsia className="size-20 fill-foreground" />
                </Button>
                <h1 className="text-xl font-semibold tracking-wide">Dashboard</h1>
                <div className="ml-auto gap-1.5 text-sm">
                    <UserProfileMenu />
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="bg-base-secondary sticky left-0 z-40 w-14 overflow-y-auto">
                    <nav className="flex flex-col items-center">
                        <SideNav />
                    </nav>
                </aside>

                {/* Children */}
                <div className="bg-base-primary flex flex-1 overflow-y-auto p-5">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

function SideNav() {
    const location = useLocation();

    const tabs = [
        {
            _id: "homepage",
            title: "Homepage",
            icon: <MdSpaceDashboard />,
            url: "/dashboard/homepage/",
            // logic for determining if the current tab is active
            isActive: (() => location.pathname.includes("homepage"))(),
        },
    ];

    return (
        <TooltipProvider>
            {tabs.map((tab) => {
                return (
                    <Tooltip key={tab._id}>
                        <TooltipTrigger asChild>
                            <Link
                                to={tab?.url}
                                className={cn(
                                    "flex w-full items-center justify-center p-2 [&>svg]:size-8",
                                    tab?.isActive &&
                                        "bg-java-50 text-java-primary dark:bg-java-800",
                                )}
                            >
                                {tab?.icon}
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={7}>
                            {tab?.title}
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </TooltipProvider>
    );
}

function UserProfileMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="default"
                    className="dark:bg-base-secondary flex size-full items-center space-x-2 bg-transparent text-foreground !shadow-none hover:bg-transparent"
                >
                    <Avatar className="size-9">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="@shadcn" />
                        <AvatarFallback>NN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">John Doe</span>
                        <span className="text-xs text-gray-500">Project Manager</span>
                    </div>
                    <div className="self-start">
                        <RiArrowDownSFill className="size-6 text-gray-400" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Profile
                    <FaRegCircleUser className="ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Settings
                    <LuSettings className="ml-auto" />
                </DropdownMenuItem>
                <ThemeToggler />
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    Logout
                    <FiLogOut className="ml-auto" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function ThemeToggler() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>Change Theme</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        Light
                        <SunIcon className="ml-auto" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        Dark
                        <MoonIcon className="ml-auto" />
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        System
                        <MdComputer className="ml-auto" />
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
