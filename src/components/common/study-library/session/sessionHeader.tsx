import { MyButton } from "@/components/design-system/button";
import { Plus } from "phosphor-react";

export default function SessionHeader() {
    return (
        <div className="flex flex-row gap-6">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-[600]">Manage Your Sessions</div>
                <div className="text-base">
                    Effortlessly organize, upload, and track educational resources in one place.
                    Provide students with easy access to the materials they need to succeed,
                    ensuring a seamless learning experience.
                </div>
            </div>
            <div>
                <MyButton>
                    {" "}
                    <Plus /> Add New Session
                </MyButton>
            </div>
        </div>
    );
}
