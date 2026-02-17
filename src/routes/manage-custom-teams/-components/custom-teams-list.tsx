import { MyButton } from '@/components/design-system/button';
import { Plus, User, Building2 } from 'lucide-react';
import { useState } from 'react';
import { AddMemberForm } from './add-member-form';
import { useQuery } from '@tanstack/react-query';
import { getAllFacultyV2 } from '../-services/custom-team-services';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function CustomTeamsList() {
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['custom-teams'],
        queryFn: () => getAllFacultyV2({ pageNo: 0, pageSize: 50 }),
    });

    const members = data?.content || [];

    if (isLoading) return <DashboardLoader />;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <MyButton onClick={() => setIsAddMemberOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </MyButton>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!members || members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                                        <User className="h-8 w-8 opacity-50" />
                                        <p>No members found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member: any) => (
                                <TableRow key={member.id || member.userId}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.profilePic} />
                                                <AvatarFallback>{member.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                            {member.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>{member.mobileNumber}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {member.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddMemberForm
                open={isAddMemberOpen}
                onOpenChange={setIsAddMemberOpen}
            />
        </div>
    );
}
