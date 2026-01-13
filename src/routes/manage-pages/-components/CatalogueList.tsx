import { useQuery, useMutation } from '@tanstack/react-query';
import { getCurrentInstituteId } from '@/lib/auth/instituteUtils';
import { getCatalogueTags, deleteCatalogueConfig } from '../-services/catalogue-service';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CreateCatalogueDialog } from './CreateCatalogueDialog';
import { Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useCataloguePermissions } from '../-hooks/use-catalogue-permissions';

export const CatalogueList = () => {
    const instituteId = getCurrentInstituteId();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const { canWrite, canDelete } = useCataloguePermissions();

    const {
        data: tags,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ['catalogueTags', instituteId],
        queryFn: () => getCatalogueTags(instituteId!),
        enabled: !!instituteId,
    });

    const deleteMutation = useMutation({
        mutationFn: (tagName: string) => deleteCatalogueConfig(instituteId!, tagName),
        onSuccess: () => {
            toast({ title: 'Deleted', description: 'Page deleted successfully' });
            refetch();
        },
        onError: () => {
            toast({ title: 'Error', description: 'Failed to delete page', variant: 'destructive' });
        },
    });

    if (!instituteId) return <div className="p-6">No institute selected</div>;
    if (isLoading)
        return (
            <div className="flex justify-center p-6">
                <Loader2 className="animate-spin" />
            </div>
        );

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage Pages</h1>
                    <p className="text-gray-500">
                        Create and manage your institute&apos;s websites
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!canWrite}>
                    + Create New Page
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tag Name (Route)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Modified</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags?.map((tag) => (
                            <TableRow key={tag.tagName}>
                                <TableCell className="font-medium">{tag.tagName}</TableCell>
                                <TableCell>
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            tag.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : tag.status === 'DRAFT'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {tag.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {tag.lastModified
                                        ? new Date(tag.lastModified).toLocaleDateString()
                                        : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate({
                                                    to: '/manage-pages/editor/$tagName',
                                                    params: { tagName: tag.tagName },
                                                })
                                            }
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={!canDelete || deleteMutation.isPending}
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        'Are you sure you want to delete this page?'
                                                    )
                                                ) {
                                                    deleteMutation.mutate(tag.tagName);
                                                }
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tags?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No pages found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreateCatalogueDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => refetch()}
            />
        </div>
    );
};
