// components/ParticipantsSidePanel.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Users, Loader2, WifiOff } from 'lucide-react'; // Added Loader2, WifiOff
import { ScrollArea } from '@/components/ui/scroll-area'; // For scrollable list

interface Participant {
    username: string;
    user_id?: string | null; // Optional, if available
    name?: string | null; // Optional
    email?: string | null; // Optional
    status: string; // e.g., 'ACTIVE', 'JOINED', 'LEFT'
    joined_at?: string; // Optional
}

interface ParticipantsSidePanelProps {
    sessionId: string;
    isOpen: boolean;
    onClose: () => void;
    topOffset?: string; // e.g., '3.5rem' or '56px' to position below a fixed header
}

export const ParticipantsSidePanel: React.FC<ParticipantsSidePanelProps> = ({
    sessionId,
    isOpen,
    onClose,
    topOffset = '0px',
}) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSseConnected, setIsSseConnected] = useState<boolean>(true); // Assume connected initially

    useEffect(() => {
        if (!isOpen || !sessionId) {
            setParticipants([]); // Clear when closed or no session ID
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // console.log(`[ParticipantsPanel] Effect run. isOpen: ${isOpen}, sessionId: ${sessionId}`);
        const sseUrl = `https://backend-stage.vacademy.io//community-service/engage/admin/${sessionId}`;
        // console.log(`[ParticipantsPanel] SSE connecting to: ${sseUrl}`);
        const eventSource = new EventSource(sseUrl, { withCredentials: true });

        eventSource.onopen = () => {
            // console.log("[ParticipantsPanel] SSE Connection Established.");
            setIsLoading(false);
            setIsSseConnected(true);
            // toast.success("Participant updates active.", { duration: 1500 });
        };

        eventSource.addEventListener('participants', (event: MessageEvent) => {
            // console.log("[ParticipantsPanel] Received 'participants' event data:", event.data);
            try {
                const parsedData = JSON.parse(event.data);
                if (Array.isArray(parsedData)) {
                    setParticipants(parsedData);
                } else {
                    // console.warn("[ParticipantsPanel] 'participants' data received is not an array:", parsedData);
                }
            } catch (error) {
                console.error("[ParticipantsPanel] Error parsing 'participants' data:", error);
            }
            setIsLoading(false); // Stop loading indicator once data (or empty array) is received
        });

        eventSource.onerror = (error) => {
            console.error('[ParticipantsPanel] SSE Error:', error);
            setIsLoading(false);
            setIsSseConnected(false);
            // toast.error("Participant updates disconnected.", { duration: 2000 });
            eventSource.close(); // Close on error to prevent excessive retries if server issue
        };

        return () => {
            // console.log("[ParticipantsPanel] Closing SSE Connection.");
            eventSource.close();
            setParticipants([]); // Clear participants on close
            setIsLoading(false);
        };
    }, [isOpen, sessionId]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed right-0 top-0 z-[1000] flex h-screen w-72 flex-col border-l border-slate-200 bg-slate-50 shadow-xl transition-transform duration-300 ease-in-out sm:w-80"
            // Adjust top based on topOffset to sit below action bar
            style={{
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                paddingTop: topOffset, // Dynamic padding for content area
                height: `calc(100vh - ${topOffset})`, // Adjust height if topOffset is applied to the main div
            }}
        >
            {/* Panel Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-3">
                <h3 className="text-md flex items-center font-semibold text-slate-700">
                    <Users size={18} className="mr-2 text-orange-500" /> Participants (
                    {participants.length})
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* Participant List */}
            <ScrollArea className="grow">
                {' '}
                {/* Content area scrolls */}
                <div className="space-y-2 p-3">
                    {!isSseConnected && !isLoading && (
                        <div className="flex flex-col items-center justify-center rounded-md border border-red-200 bg-red-50 p-4 text-center text-red-500">
                            <WifiOff size={24} className="mb-2" />
                            <p className="text-sm font-medium">Connection lost</p>
                            <p className="text-xs">Participant updates are paused.</p>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="size-6 animate-spin text-orange-500" />
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <Users size={32} className="mx-auto mb-3 text-slate-400" />
                            <p className="text-sm text-slate-500">
                                No participants have joined yet.
                            </p>
                        </div>
                    ) : (
                        participants.map((p, index) => (
                            <div
                                key={p.user_id || p.username + index}
                                className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2.5 text-sm transition-colors hover:bg-slate-50"
                            >
                                <span
                                    className="truncate font-medium text-slate-700"
                                    title={p.username}
                                >
                                    {p.name || p.username}
                                </span>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize
                                        ${
                                            p.status?.toLowerCase() === 'active' ||
                                            p.status?.toLowerCase() === 'joined'
                                                ? 'border border-green-200 bg-green-100 text-green-700'
                                                : 'border border-yellow-200 bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {p.status ? p.status.toLowerCase() : 'Joined'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
