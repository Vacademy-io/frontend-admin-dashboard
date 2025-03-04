import { AddSessionDialog } from "./session-operations/add-session/add-session-dialog";

export default function SessionHeader() {
    return (
        <div className="flex flex-row gap-6 text-neutral-600">
            <div className="flex flex-col gap-2">
                <div className="text-xl font-[600]">Manage Your Sessions</div>
                <div className="text-base">
                    Effortlessly organize, upload, and track educational resources in one place.
                    Provide students with easy access to the materials they need to succeed,
                    ensuring a seamless learning experience.
                </div>
            </div>
            <div>
                <AddSessionDialog />
            </div>
        </div>
    );
}
