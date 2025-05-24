/* eslint-disable */
// @ts-nocheck
'use client';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import React, { useEffect, useState, FormEvent } from 'react'; // Added React for FormEvent
import { Button as ShadButton } from '@/components/ui/button'; // Aliased to avoid conflict if MyButton is also Button
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, FileText as FilePresentation, Loader2, Plus, Search, Trash2 } from 'lucide-react'; // Changed Icon
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@tanstack/react-router'; // Or your specific router
import { cn } from '@/lib/utils';
import { useGetPresntation } from './hooks/useGetPresntation'; // Ensure path is correct
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getTokenDecodedData, getTokenFromCookie } from '@/lib/auth/sessionUtility';
import { TokenKey } from '@/constants/auth/tokens';
import authenticatedAxiosInstance from '@/lib/auth/axiosInstance';
import { toast } from 'sonner';
import { EDIT_PRESENTATION } from '@/constants/urls'; // Ensure this is correct
import { useQueryClient } from '@tanstack/react-query';
import { MyButton } from '@/components/design-system/button'; // Your custom button

// Assuming PresentationData is defined in your types.ts or similar
import type { PresentationData } from './types'; // Adjust path as needed

export default function ManagePresentation() {
    const router = useRouter();
    const { setNavHeading } = useNavHeadingStore();
    const queryClient = useQueryClient();

    const { data: fetchedPresentations, isLoading } = useGetPresntation();
    const [presentations, setPresentations] = useState<PresentationData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    // const [activeTab, setActiveTab] = useState('all'); // Tabs not implemented in provided JSX

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPresentation, setEditingPresentation] = useState<PresentationData | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [presentationToDelete, setPresentationToDelete] = useState<PresentationData | null>(null);
    const [isProcessingDelete, setIsProcessingDelete] = useState(false);

    useEffect(() => {
        setNavHeading('Manage Presentations'); // Corrected heading
    }, [setNavHeading]);

    useEffect(() => {
        if (fetchedPresentations) {
            setPresentations(fetchedPresentations as PresentationData[]); // Ensure fetched data matches PresentationData
        }
    }, [fetchedPresentations]);

    const handleCreatePresentation = (e: FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) {
            toast.error('Title is required to create a presentation.');
            return;
        }
        // Navigate to the editor with new presentation details
        router.navigate({
            to: `/study-library/present/add`, // Your route for the editor
            search: {
                title: newTitle,
                description: newDescription,
                id: '', // No ID for new presentation yet, editor should handle creation
                isEdit: false, // Explicitly false
            },
        });
        setIsCreateModalOpen(false);
        setNewTitle('');
        setNewDescription('');
    };

    const handleEditPresentationDetails = (presentation: PresentationData) => {
        setEditingPresentation(presentation);
        // For now, directly navigate to editor. If modal was for title/desc only:
        // setNewTitle(presentation.title);
        // setNewDescription(presentation.description || '');
        // setIsEditModalOpen(true);

        // Navigate to editor to edit content and details
        router.navigate({
            to: `/study-library/present/add`, // Your route for the editor
            search: {
                title: presentation.title,
                description: presentation.description,
                id: presentation.id,
                isEdit: true,
            },
        });
    };

    // If you had a modal for just updating title/description:
    /*
    const handleUpdatePresentationDetails = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingPresentation || !newTitle.trim()) {
            toast.error("Title cannot be empty.");
            return;
        }
        // API call to update title/description
        // ...
        // After success:
        // queryClient.invalidateQueries({ queryKey: ['GET_PRESNTATIONS'] });
        // setIsEditModalOpen(false);
        // setEditingPresentation(null);
        toast.info("Navigation to full editor for content changes.");
    };
    */

    const confirmDeletePresentation = (presentation: PresentationData) => {
        setPresentationToDelete(presentation);
        setIsDeleteDialogOpen(true);
    };

    const executeDeletePresentation = async () => {
        if (!presentationToDelete) return;
        setIsProcessingDelete(true);
        try {
            const accessToken = getTokenFromCookie(TokenKey.accessToken);
            if (!accessToken) {
                toast.error('Authentication required. Please log in.');
                setIsProcessingDelete(false);
                return;
            }
            const tokenData = getTokenDecodedData(accessToken);
            const INSTITUTE_ID = tokenData?.authorities && Object.keys(tokenData.authorities)[0];
            if (!INSTITUTE_ID) {
                toast.error('Institute ID not found. Cannot delete presentation.');
                setIsProcessingDelete(false);
                return;
            }

            // Assuming API expects the full presentation object with status 'DELETED'
            await authenticatedAxiosInstance.post(
                EDIT_PRESENTATION, // This URL might be for update; ensure backend handles delete correctly
                {
                    ...presentationToDelete,
                    status: 'DELETED',
                    added_slides: [],
                    updated_slides: [],
                    deleted_slides: [],
                },
                {
                    params: { instituteId: INSTITUTE_ID },
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            await queryClient.refetchQueries({ queryKey: ['GET_PRESNTATIONS'] });
            toast.success(`Presentation "${presentationToDelete.title}" deleted successfully.`);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(
                error.response?.data?.message || error.message || 'Failed to delete presentation.'
            );
        } finally {
            setIsProcessingDelete(false);
            setIsDeleteDialogOpen(false);
            setPresentationToDelete(null);
        }
    };

    const filteredPresentations = presentations.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
            p.title?.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query) // ||
            // p.category?.toLowerCase().includes(query) // If category exists
        );
    });

    // Card Status styling (example)
    const getStatusBadgeClass = (status: string = 'draft') => {
        switch (status.toLowerCase()) {
            case 'published':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'draft':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'archived':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 text-neutral-800 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Presentations</h1>
                    <p className="text-md mt-1.5 text-neutral-500">
                        Manage, create, and organize your presentation materials.
                    </p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <MyButton size="lg" className="gap-2 px-5 py-2.5">
                            <Plus className="h-5 w-5" /> New Presentation
                        </MyButton>
                    </DialogTrigger>
                    <DialogContent className="p-6 sm:max-w-lg">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-semibold">
                                Create New Presentation
                            </DialogTitle>
                            <DialogDescription className="text-sm text-neutral-500">
                                Provide a title and description. You'll add slides in the next step.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePresentation} className="space-y-5">
                            <div>
                                <Label htmlFor="new-title" className="text-sm font-medium">
                                    Title
                                </Label>
                                <Input
                                    id="new-title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="mt-1.5 w-full"
                                    placeholder="e.g., Quarterly Business Review"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-description" className="text-sm font-medium">
                                    Description (Optional)
                                </Label>
                                <Textarea
                                    id="new-description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="mt-1.5 min-h-[80px] w-full"
                                    placeholder="A brief summary of your presentation"
                                    rows={3}
                                />
                            </div>
                            <DialogFooter className="mt-6 !justify-stretch space-y-2 sm:flex sm:flex-row sm:space-x-3 sm:space-y-0">
                                <MyButton
                                    type="button"
                                    buttonType="secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </MyButton>
                                <MyButton type="submit" className="w-full sm:w-auto">
                                    Create & Add Slides
                                </MyButton>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search Input */}
            <div className="mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <Input
                        placeholder="Search presentations by title or description..."
                        className="w-full rounded-lg bg-white py-2.5 pl-10 pr-4 text-base shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Presentation Cards Grid */}
            {filteredPresentations.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPresentations.map((p) => (
                        <Card
                            key={p.id}
                            className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-lg"
                        >
                            <CardHeader className="px-4 pb-3 pt-4">
                                <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight text-neutral-800 transition-colors hover:text-orange-600">
                                    {p.title || 'Untitled Presentation'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow px-4 pb-3">
                                <p className="mb-3 line-clamp-3 min-h-[60px] text-sm text-neutral-600">
                                    {p.description || 'No description available.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'border px-2 py-0.5 font-normal',
                                            getStatusBadgeClass(p.status || 'draft')
                                        )}
                                    >
                                        {p.status
                                            ? p.status.charAt(0).toUpperCase() + p.status.slice(1)
                                            : 'Draft'}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="border-neutral-200 bg-neutral-50 px-2 py-0.5 font-normal"
                                    >
                                        {p.added_slides_count || p.added_slides?.length || 0} slides
                                    </Badge>
                                </div>
                            </CardContent>
                            <CardFooter className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-2.5">
                                <span className="text-xs text-neutral-500">
                                    Updated:{' '}
                                    {p.updated_at
                                        ? new Date(p.updated_at).toLocaleDateString()
                                        : 'N/A'}
                                </span>
                                <div className="flex gap-0.5">
                                    <ShadButton
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-md text-neutral-500 hover:bg-orange-100 hover:text-orange-600"
                                        onClick={() => handleEditPresentationDetails(p)}
                                        title="Edit Presentation"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </ShadButton>
                                    <ShadButton
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-md text-neutral-500 hover:bg-red-100 hover:text-red-600"
                                        onClick={() => confirmDeletePresentation(p)}
                                        title="Delete Presentation"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </ShadButton>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/70 px-6 py-20 text-center">
                    <FilePresentation className="mb-5 h-16 w-16 text-neutral-300" />
                    <h3 className="text-xl font-semibold text-neutral-700">
                        {searchQuery ? 'No Matching Presentations' : 'No Presentations Yet'}
                    </h3>
                    <p className="mt-2 max-w-sm text-neutral-500">
                        {searchQuery
                            ? `Your search for "${searchQuery}" did not return any results. Try a different term or clear the search.`
                            : "It looks like you haven't created any presentations. Get started by clicking the 'New Presentation' button."}
                    </p>
                    {searchQuery && (
                        <MyButton
                            variant="outline"
                            className="mt-6"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear Search
                        </MyButton>
                    )}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="p-6 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-red-600">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-neutral-600">
                            Are you sure you want to delete the presentation titled "
                            <strong>{presentationToDelete?.title || ''}</strong>"? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6 !justify-stretch space-y-2 sm:flex sm:flex-row sm:space-x-3 sm:space-y-0">
                        <MyButton
                            type="button"
                            buttonType="secondary"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isProcessingDelete}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </MyButton>
                        <MyButton
                            type="button"
                            variant="destructive"
                            onClick={executeDeletePresentation}
                            disabled={isProcessingDelete}
                            className="w-full sm:w-auto"
                        >
                            {isProcessingDelete ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                                </>
                            ) : (
                                'Yes, Delete Presentation'
                            )}
                        </MyButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
