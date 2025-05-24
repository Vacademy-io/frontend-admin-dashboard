/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Copy,
    Users,
    PlayCircle,
    QrCodeIcon,
    LinkIcon,
    Loader2,
    Wifi,
    WifiOff,
    ShieldCheck,
} from 'lucide-react'; // Added ShieldCheck
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area'; // For participant list

interface Participant {
    username: string;
    user_id?: string | null;
    name?: string | null;
    email?: string | null;
    status: string;
    joined_at?: string;
}

interface SessionDetails {
    session_id: string;
    invite_code: string;
    title?: string; // Added for presentation title
    // Allow any other fields that might come from the session creation API response
    [key: string]: any;
}

interface WaitingRoomProps {
    sessionDetails: SessionDetails;
    onStartPresentation: () => void;
    onCancelSession: () => void;
    isStarting?: boolean;
}

// QR Code instance (can be defined outside if it doesn't need props from component)
const qrCodeInstance = new QRCodeStyling({
    width: 220, // Slightly adjusted for modern look
    height: 220,
    type: 'svg',
    dotsOptions: { color: '#1E293B', type: 'rounded' }, // slate-800
    backgroundOptions: { color: 'transparent' },
    imageOptions: { crossOrigin: 'anonymous', margin: 5, imageSize: 0.2 }, // Smaller logo margin
    cornersSquareOptions: { type: 'extra-rounded', color: '#F97316' }, // orange-500
    cornersDotOptions: { type: 'dot', color: '#EA580C' }, // orange-600
});

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
    sessionDetails,
    onStartPresentation,
    onCancelSession,
    isStarting,
}) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isSseConnected, setIsSseConnected] = useState<boolean>(false); // Start false, update on SSE open
    const [isSseLoading, setIsSseLoading] = useState<boolean>(true); // For initial connection attempt
    const qrRef = useRef<HTMLDivElement>(null);

    const { session_id: sessionId, invite_code: inviteCode } = sessionDetails;
    // Use provided title or default
    const presentationTitle =
        sessionDetails.title || sessionDetails.slides?.title || 'Live Session Starting Soon';
    const invitationLink =
        typeof window !== 'undefined'
            ? `${window.location.origin}/engage/${inviteCode}`
            : `/engage/${inviteCode}`;

    useEffect(() => {
        if (qrRef.current && invitationLink) {
            qrCodeInstance.update({ data: invitationLink });
            qrRef.current.innerHTML = '';
            qrCodeInstance.append(qrRef.current);
        }
    }, [invitationLink]);

    useEffect(() => {
        if (!sessionId) return;

        setIsSseLoading(true);
        // console.log(`[WaitingRoom] SSE init. Session ID: ${sessionId}`);
        const sseUrl = `https://backend-stage.vacademy.io/community-service/engage/admin/${sessionId}`;
        const eventSource = new EventSource(sseUrl, { withCredentials: true });

        eventSource.onopen = () => {
            // console.log("[WaitingRoom] SSE Connection Established.");
            setIsSseConnected(true);
            setIsSseLoading(false);
            // toast.success("Live participant updates active.", { duration: 2000 });
        };

        eventSource.addEventListener('participants', (event: MessageEvent) => {
            // console.log("[WaitingRoom] Received 'participants' data:", event.data);
            try {
                const parsedData = JSON.parse(event.data);
                if (Array.isArray(parsedData)) {
                    setParticipants(parsedData);
                }
            } catch (error) {
                console.error("[WaitingRoom] Error parsing 'participants' JSON:", error);
            }
        });

        eventSource.onerror = (error) => {
            console.error('[WaitingRoom] SSE Error:', error);
            setIsSseConnected(false);
            setIsSseLoading(false);
            toast.error('Participant updates disconnected. Will attempt to reconnect.', {
                duration: 3000,
            });
            // EventSource attempts to reconnect automatically by default.
            // For critical failures, it will close.
        };

        return () => {
            // console.log("[WaitingRoom] Closing SSE Connection.");
            eventSource.close();
            setIsSseConnected(false);
            setIsSseLoading(false);
            setParticipants([]); // Clear participants
        };
    }, [sessionId]);

    const handleCopy = useCallback((text: string, type: string) => {
        if (navigator.clipboard) {
            navigator.clipboard
                .writeText(text)
                .then(() => toast.success(`${type} copied!`))
                .catch(() => toast.error(`Failed to copy ${type}.`));
        } else {
            toast.info('Clipboard access is not available in this browser/context.');
        }
    }, []);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-start overflow-y-auto bg-gradient-to-br from-slate-100 via-gray-100 to-stone-200 p-4 pt-10 text-slate-800 sm:pt-16">
            <div className="absolute left-4 top-4 z-10">
                <Button
                    variant="outline"
                    onClick={onCancelSession}
                    className="border-slate-300 text-slate-700 shadow-sm hover:bg-slate-200"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Editor
                </Button>
            </div>

            <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-8">
                <header className="mb-6 text-center sm:mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-orange-600 sm:text-3xl">
                        {presentationTitle}
                    </h1>
                    <p className="sm:text-md text-sm text-slate-500">
                        Waiting for participants to join...
                    </p>
                    <div
                        className={`mx-auto mt-3 flex max-w-fit items-center justify-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium
                        ${isSseLoading ? 'bg-slate-100 text-slate-500' : isSseConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                        {isSseLoading ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : isSseConnected ? (
                            <Wifi size={13} />
                        ) : (
                            <WifiOff size={13} />
                        )}
                        {isSseLoading
                            ? 'Connecting...'
                            : isSseConnected
                              ? 'Live Updates Active'
                              : 'Updates Disconnected'}
                    </div>
                </header>

                <div className="grid grid-cols-1 items-start gap-6 sm:gap-8 md:grid-cols-2">
                    {/* Left Panel: Invite Info */}
                    <div className="flex flex-col items-center space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-lg sm:p-6">
                        <h2 className="flex items-center text-lg font-semibold text-slate-700 sm:text-xl">
                            <QrCodeIcon className="mr-2 size-5 text-orange-500 sm:size-6" /> Invite
                            Participants
                        </h2>
                        <div
                            ref={qrRef}
                            className="overflow-hidden rounded-lg border-2 border-orange-400 bg-white p-1 shadow-md transition-all hover:scale-105"
                        >
                            {/* QR Code is appended here */}
                        </div>
                        <div className="w-full space-y-3 text-sm">
                            <div className="text-center text-xs text-slate-600 sm:text-sm">
                                Scan QR or share link/code:
                            </div>
                            <div className="flex items-center rounded-md border bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-orange-400">
                                <LinkIcon className="ml-1 mr-2 size-4 shrink-0 text-slate-400 sm:size-5" />
                                <input
                                    type="text"
                                    readOnly
                                    value={invitationLink}
                                    className="grow select-all truncate bg-transparent text-xs text-blue-600 focus:outline-none sm:text-sm"
                                    onClick={(e) => (e.target as HTMLInputElement).select()}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCopy(invitationLink, 'Link')}
                                    className="ml-1 size-7 text-orange-500 hover:text-orange-600 sm:size-8"
                                >
                                    <Copy size={14} />
                                </Button>
                            </div>
                            <div className="flex items-center justify-center rounded-md border bg-white p-2.5 shadow-sm sm:p-3">
                                <span className="mr-2 text-xs text-slate-500">Code:</span>
                                <strong className="select-all font-mono text-xl tracking-wider text-orange-600 sm:text-2xl">
                                    {inviteCode}
                                </strong>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCopy(inviteCode, 'Code')}
                                    className="ml-auto size-7 text-orange-500 hover:text-orange-600 sm:size-8"
                                >
                                    <Copy size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Participants & Start Button */}
                    <div className="flex flex-col space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-lg sm:p-6">
                        <h3 className="flex items-center text-lg font-semibold text-slate-700 sm:text-xl">
                            <Users className="mr-2 size-5 text-orange-500 sm:size-6" /> Joined (
                            {participants.length})
                        </h3>
                        <ScrollArea className="h-48 max-h-60 min-h-48 rounded-md border bg-white shadow-inner">
                            <div className="space-y-1.5 p-2">
                                {participants.length === 0 ? (
                                    <div className="flex h-full min-h-40 flex-col items-center justify-center p-4 text-center text-slate-400">
                                        <Users size={30} className="mb-2" />
                                        <p className="text-xs sm:text-sm">No one has joined yet.</p>
                                        <p className="mt-1 text-xs">
                                            Share invite details to get started!
                                        </p>
                                    </div>
                                ) : (
                                    participants.map((p, index) => (
                                        <li
                                            key={p.user_id || p.username + index}
                                            className="flex list-none items-center justify-between rounded-md border border-slate-200 bg-slate-100 p-2 text-xs hover:bg-slate-200/70 sm:text-sm"
                                        >
                                            <span
                                                className="truncate font-medium text-slate-700"
                                                title={p.username}
                                            >
                                                {p.name || p.username}
                                            </span>
                                            <span
                                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold capitalize sm:text-xs
                                                ${p.status?.toLowerCase() === 'active' || p.status?.toLowerCase() === 'joined' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                                            >
                                                {p.status ? p.status.toLowerCase() : 'Joined'}
                                            </span>
                                        </li>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        <Button
                            onClick={onStartPresentation}
                            disabled={isStarting || isSseLoading} // Also disable if SSE is still loading initially
                            size="lg" // Larger button for primary action
                            className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-opacity-75"
                        >
                            {isStarting ? (
                                <Loader2 size={20} className="mr-2 animate-spin" />
                            ) : (
                                <PlayCircle size={20} className="mr-2" />
                            )}
                            {isStarting ? 'Starting Session...' : 'Start Presentation'}
                        </Button>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-center text-center text-xs text-slate-400">
                    <ShieldCheck size={13} className="mr-1.5 text-green-500" />
                    All connections are secure. Waiting for you to start the session.
                </div>
            </div>
        </div>
    );
};
