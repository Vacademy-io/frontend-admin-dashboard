import { SessionData } from "@/types/study-library/session-types";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree } from "phosphor-react";
import { Button } from "@/components/ui/button";

interface SessionCardProps {
    data: SessionData;
}

export function SessionCard({ data }: SessionCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl border p-6">
            <div className="flex flex-row items-end justify-between">
                <div>
                    <div className="text-lg font-[600]">{data?.session?.session_name}</div>
                    <div className="text-sm text-neutral-500">Start Date</div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button variant="outline" className="h-6 bg-transparent p-1 shadow-none">
                            <DotsThree size={20} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem className="cursor-pointer">Edit Session</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                            Delete Session
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="border-t"></div>
            <div className="grid grid-cols-4 gap-4">
                {data?.packages.map((item, idx) => (
                    <div key={idx}>
                        <div className="text-base">{item?.package_dto.package_name}</div>
                        <div>
                            {item.level.map((level, idx) => (
                                <div key={idx} className="flex flex-row items-center gap-1">
                                    <div className="size-2 rounded-full bg-neutral-300"></div>
                                    <div className="text-sm">{level.level_name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
