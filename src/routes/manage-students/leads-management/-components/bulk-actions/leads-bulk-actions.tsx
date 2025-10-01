import { LeadTable } from '../../-types/leads-types';
import { Button } from '@/components/ui/button';
import { Trash, UserPlus, Tag } from 'phosphor-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mail, MessageCircle, MoreHorizontal } from 'lucide-react';

interface LeadsBulkActionsProps {
    selectedCount: number;
    selectedLeadIds: string[];
    selectedLeads: LeadTable[];
    onReset: () => void;
}

export const LeadsBulkActions = ({
    selectedCount,
    selectedLeadIds,
    selectedLeads,
    onReset,
}: LeadsBulkActionsProps) => {
    console.log({ selectedLeadIds, selectedLeads });
    if (selectedCount === 0) {
        return (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>Select leads to perform bulk actions</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-700">
                    {selectedCount} lead{selectedCount > 1 ? 's' : ''} selected
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-8 px-2 text-xs text-neutral-500 hover:text-neutral-700"
                >
                    Clear
                </Button>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 border-neutral-300 bg-white px-3 text-xs hover:bg-neutral-50"
                    >
                        <MoreHorizontal className="size-4" />
                        Actions
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem className="flex items-center gap-2 text-xs">
                        <Mail className="size-4" />
                        Send Email
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 text-xs">
                        <MessageCircle className="size-4" />
                        Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 text-xs">
                        <UserPlus className="size-4" />
                        Convert to Student
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 text-xs">
                        <Tag className="size-4" />
                        Add Tags
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700">
                        <Trash className="size-4" />
                        Delete Leads
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
