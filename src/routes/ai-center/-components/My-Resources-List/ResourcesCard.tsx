import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Adjust path based on your project structure
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'; // Adjust path
import { Badge } from '@/components/ui/badge'; // Adjust path
import { Button } from '@/components/ui/button'; // Adjust path
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Added for dropdown menu
import { Download, MoreVertical, Eye } from 'lucide-react'; // Added MoreVertical and Eye icons
// --- Type Definitions ---
interface FileDetail {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    created_on: string; // ISO date string
    // Optional fields from API, present in the example:
    source?: string;
    source_id?: string;
    expiry?: string;
    width?: number;
    height?: number;
    updated_on?: string;
}
interface TaskStatus {
    id: string; // ID of the task status object
    // Other task-specific fields from API example
    task_name?: string;
    institute_id?: string;
    status?: string;
    result_json?: string; // Can be a complex JSON string
    input_id?: string;
    input_type?: string;
    created_at?: string; // Task creation/update time
    updated_at?: string; // Task creation/update time
    parent_id?: string | null;
    file_detail: FileDetail | null; // The file associated with this task status
}
interface ResourceFilesPageProps {
    apiResponse: TaskStatus[]; // The array of task status objects from your API
}
// --- Helper Function ---
const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true, // Common preference, can be set to false
        });
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Invalid Date';
    }
};
// --- React Component ---
export function ResourcesCard({ apiResponse }: ResourceFilesPageProps) {
    const processedFiles = useMemo(() => {
        const uniqueFilesMap = new Map<string, FileDetail>();
        apiResponse.forEach((task) => {
            // Ensure task and file_detail exist and have a valid id and other critical fields
            if (
                task &&
                task.file_detail &&
                task.file_detail.id &&
                task.file_detail.url &&
                task.file_detail.created_on
            ) {
                if (!uniqueFilesMap.has(task.file_detail.id)) {
                    uniqueFilesMap.set(task.file_detail.id, task.file_detail);
                }
            }
        });
        const uniqueFilesArray = Array.from(uniqueFilesMap.values());
        // Sort by file_detail.created_on in descending order
        uniqueFilesArray.sort((fileA, fileB) => {
            const dateA = fileA.created_on ? new Date(fileA.created_on).getTime() : 0;
            const dateB = fileB.created_on ? new Date(fileB.created_on).getTime() : 0;
            if (isNaN(dateA) && isNaN(dateB)) return 0;
            if (isNaN(dateA)) return 1; // Put invalid dates last or first
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
        });
        return uniqueFilesArray;
    }, [apiResponse]);
    if (!apiResponse || apiResponse.length === 0 || processedFiles.length === 0) {
        return (
            <Card className="mx-auto my-8 w-full max-w-4xl shadow-lg">
                <CardHeader>
                    <CardTitle>Resources</CardTitle>
                    <CardDescription>Manage and view your uploaded files.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="py-10 text-center">
                        <svg
                            className="mx-auto size-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No files found.</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            There are currently no resources available or associated files are
                            missing details.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card className="mx-auto my-8 w-full shadow-lg">
            <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                    A list of unique files, ordered by the most recently created.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">File Name</TableHead>
                            <TableHead className="w-1/5">Type</TableHead>
                            <TableHead className="w-1/4 text-right">Created On</TableHead>
                            <TableHead className="w-1/5 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {processedFiles?.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center justify-between space-x-2">
                                        <span className="truncate" title={file.file_name}>
                                            {file.file_name}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 shrink-0"
                                                >
                                                    <MoreVertical className="size-4" />
                                                    <span className="sr-only">
                                                        Open menu for {file.file_name}
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onSelect={() =>
                                                        alert(
                                                            `Action: View details for ${file.file_name}`
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onSelect={() =>
                                                        alert(`Action: Rename ${file.file_name}`)
                                                    }
                                                >
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 hover:!text-red-600 focus:text-red-600"
                                                    onSelect={() =>
                                                        alert(`Action: Delete ${file.file_name}`)
                                                    }
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="whitespace-nowrap">
                                        {file.file_type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-sm text-gray-600">
                                    {formatDate(file.created_on)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        {file.url ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title={`Open ${file.file_name}`}
                                                >
                                                    <a
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        aria-label={`Open ${file.file_name} in new tab`}
                                                    >
                                                        <Eye className="size-4 text-gray-700 hover:text-gray-900" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    title={`Download ${file.file_name}`}
                                                >
                                                    <a
                                                        href={file.url}
                                                        download={file.file_name} // Suggests browser to download with this name
                                                        rel="noopener noreferrer"
                                                        aria-label={`Download ${file.file_name}`}
                                                    >
                                                        <Download className="size-4 text-gray-700 hover:text-gray-900" />
                                                    </a>
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-400">-</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
export default ResourcesCard;
