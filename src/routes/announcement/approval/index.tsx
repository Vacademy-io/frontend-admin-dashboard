import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { useEffect } from 'react';

export const Route = createFileRoute('/announcement/approval/')({
    component: () => (
        <LayoutContainer>
            <AnnouncementApprovalPage />
        </LayoutContainer>
    ),
});

function AnnouncementApprovalPage() {
    const { setNavHeading } = useNavHeadingStore();

    useEffect(() => {
        setNavHeading('Announcement Approval');
    }, [setNavHeading]);

    return (
        <div className="p-4">
            {/* TODO: Pending approvals list with approve/reject actions */}
            <h2 className="text-xl font-semibold">Announcement Approval</h2>
        </div>
    );
}
