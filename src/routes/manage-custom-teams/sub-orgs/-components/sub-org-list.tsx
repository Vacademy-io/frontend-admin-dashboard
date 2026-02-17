import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubOrgs } from '../../-services/custom-team-services';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { MyButton } from '@/components/design-system/button';
import { Plus, Building2 } from 'lucide-react';
import { CreateSubOrgModal } from './create-sub-org-modal';
import { DashboardLoader } from '@/components/core/dashboard-loader';

export function SubOrgList() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const instituteId = getCurrentInstituteId();
    const { data: subOrgsData, isLoading } = useQuery({
        queryKey: ['sub-orgs-list', instituteId],
        queryFn: () => getSubOrgs(instituteId),
        enabled: !!instituteId,
    });

    const subOrgs = Array.isArray(subOrgsData) ? subOrgsData : (subOrgsData as any)?.content || [];

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <MyButton onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sub-Organization
                </MyButton>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!subOrgs || subOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                        <Building2 className="h-8 w-8 opacity-50" />
                                        <p>No sub-organizations found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            subOrgs.map((org: any) => (
                                <TableRow key={org.sub_org_id || org.suborgId || org.subOrgId || org.suborg_id || org.id}>
                                    <TableCell className="font-medium">{org.name || org.instituteName || org.subOrgName}</TableCell>
                                    <TableCell>{org.email}</TableCell>
                                    <TableCell>{org.phone}</TableCell>
                                    <TableCell>{org.description}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateSubOrgModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />
        </div>
    );
}
