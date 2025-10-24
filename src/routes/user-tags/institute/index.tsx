import { createFileRoute } from '@tanstack/react-router';
import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { useEffect, useState } from 'react';
import { useNavHeadingStore } from '@/stores/layout-container/useNavHeadingStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    getInstituteTags,
    getDefaultTags,
    createInstituteTag,
    getUserCountsByTags,
    getUserDetailsByTags,
    type TagItem,
    type TagUserDetailItem,
} from '@/services/tag-management';
import { toast } from 'sonner';

export const Route = createFileRoute('/user-tags/institute/')({
    component: () => (
        <LayoutContainer>
            <RouteComponent />
        </LayoutContainer>
    ),
});

function RouteComponent() {
    const { setNavHeading } = useNavHeadingStore();
    const [instituteTags, setInstituteTags] = useState<TagItem[]>([]);
    const [defaultTags, setDefaultTags] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagDesc, setNewTagDesc] = useState('');
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [detailsOpenForTagId, setDetailsOpenForTagId] = useState<string | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [userDetails, setUserDetails] = useState<TagUserDetailItem[]>([]);

    useEffect(() => {
        setNavHeading('Manage User Tags • Institute Tags');
    }, [setNavHeading]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [inst, defs] = await Promise.all([getInstituteTags(), getDefaultTags()]);
            setInstituteTags(inst);
            setDefaultTags(defs);
            // Fetch counts for institute tags
            if (inst.length > 0) {
                const res = await getUserCountsByTags(inst.map((t) => t.id));
                setCounts(res.tagCounts || {});
            } else {
                setCounts({});
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to load tags';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const onCreate = async () => {
        if (!newTagName.trim()) {
            toast.error('Please provide a tag name');
            return;
        }
        setCreating(true);
        try {
            await createInstituteTag({
                tagName: newTagName.trim(),
                description: newTagDesc || undefined,
            });
            setNewTagName('');
            setNewTagDesc('');
            toast.success('Tag created');
            fetchAll();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to create tag';
            toast.error(msg);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6 p-2">
            <Card>
                <CardHeader>
                    <CardTitle>Add Institute Tag</CardTitle>
                    <CardDescription>Create a new tag for this institute</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                        <Label>Tag Name</Label>
                        <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Input value={newTagDesc} onChange={(e) => setNewTagDesc(e.target.value)} />
                    </div>
                    <div>
                        <Button disabled={creating} onClick={onCreate}>
                            {creating ? 'Creating...' : 'Create Tag'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Institute Tags</CardTitle>
                        <CardDescription>Tags specific to this institute</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-2 text-sm">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {instituteTags.map((t) => {
                                    const countByName = counts[t.tagName] ?? 0;
                                    return (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between rounded border p-2 text-sm"
                                        >
                                            <div>
                                                <div className="font-medium">{t.tagName}</div>
                                                {t.description && (
                                                    <div className="text-muted-foreground">
                                                        {t.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs">Users: {countByName}</div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        setDetailsOpenForTagId(t.id);
                                                        setDetailsLoading(true);
                                                        try {
                                                            const res = await getUserDetailsByTags([
                                                                t.id,
                                                            ]);
                                                            setUserDetails(res);
                                                        } catch (err) {
                                                            setUserDetails([]);
                                                        } finally {
                                                            setDetailsLoading(false);
                                                        }
                                                    }}
                                                >
                                                    Show Users
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                                {instituteTags.length === 0 && (
                                    <div className="p-2 text-sm">No institute tags yet.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                {detailsOpenForTagId && (
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Users for selected tag</CardTitle>
                                <CardDescription>
                                    {detailsLoading
                                        ? 'Loading users...'
                                        : `${userDetails.length} user(s) found`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-3 flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setDetailsOpenForTagId(null);
                                            setUserDetails([]);
                                        }}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            // export the current list as CSV
                                            const header =
                                                'userId,fullName,username,email,phoneNumber,enrollmentId\n';
                                            const rows = userDetails
                                                .map(
                                                    (u) =>
                                                        `${u.userId || ''},${u.fullName || ''},${u.username || ''},${u.email || ''},${u.phoneNumber || ''},${u.enrollmentId || ''}`
                                                )
                                                .join('\n');
                                            const blob = new Blob([header + rows + '\n'], {
                                                type: 'text/csv;charset=utf-8;',
                                            });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'tag_users.csv';
                                            a.click();
                                            URL.revokeObjectURL(url);
                                        }}
                                    >
                                        Export CSV
                                    </Button>
                                </div>
                                <div className="max-h-80 overflow-auto rounded border">
                                    {detailsLoading ? (
                                        <div className="p-2 text-sm">Loading...</div>
                                    ) : userDetails.length === 0 ? (
                                        <div className="p-2 text-sm">No users found.</div>
                                    ) : (
                                        <div className="text-xs">
                                            <div className="grid grid-cols-6 gap-2 border-b p-2 font-medium">
                                                <div>User ID</div>
                                                <div>Full name</div>
                                                <div>Username</div>
                                                <div>Email</div>
                                                <div>Phone</div>
                                                <div>Enrollment</div>
                                            </div>
                                            {userDetails.map((u) => (
                                                <div
                                                    key={u.userId}
                                                    className="grid grid-cols-6 gap-2 border-b p-2"
                                                >
                                                    <div>{u.userId}</div>
                                                    <div>{u.fullName || '-'}</div>
                                                    <div>{u.username || '-'}</div>
                                                    <div>{u.email || '-'}</div>
                                                    <div>{u.phoneNumber || '-'}</div>
                                                    <div>{u.enrollmentId || '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle>Default Tags</CardTitle>
                        <CardDescription>
                            System-wide tags available to all institutes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-2 text-sm">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {defaultTags.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between rounded border p-2 text-sm"
                                    >
                                        <div>
                                            <div className="font-medium">{t.tagName}</div>
                                            {t.description && (
                                                <div className="text-muted-foreground">
                                                    {t.description}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs">{t.status}</div>
                                    </div>
                                ))}
                                {defaultTags.length === 0 && (
                                    <div className="p-2 text-sm">No default tags available.</div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
