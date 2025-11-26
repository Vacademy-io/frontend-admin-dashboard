import { useEffect, useState } from 'react';
import { loadPlanningTemplate, unwrapContentFromHTML } from '../../-utils/templateLoader';
import TipTapEditor from '@/components/tiptap/TipTapEditor';
import { Button } from '@/components/ui/button';
import { Eye, Code, Plus } from 'lucide-react';

interface PlanningHTMLEditorProps {
    value: string;
    onChange: (html: string) => void;
}

export default function PlanningHTMLEditor({ value, onChange }: PlanningHTMLEditorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [addTableRowTrigger, setAddTableRowTrigger] = useState<{ nonce: number } | undefined>();

    // Load template on first render if value is empty
    useEffect(() => {
        if (!value) {
            setIsLoading(true);
            loadPlanningTemplate()
                .then((template) => {
                    onChange(template);
                })
                .catch((error) => {
                    console.error('Failed to load template:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, []);

    const handleAddRow = () => {
        // Trigger table row insertion in TipTap
        setAddTableRowTrigger({
            nonce: Date.now()
        });
    };

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading template...</div>;
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Fill in the planning template below. Use the "Add Row" button to add more lessons.
                </p>
                <div className="flex gap-2">
                    {!showPreview && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddRow}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Row
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? (
                            <>
                                <Code className="h-4 w-4 mr-2" />
                                Edit
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {showPreview ? (
                <div className="border rounded-md">
                    <TipTapEditor
                        value={unwrapContentFromHTML(value)}
                        editable={false}
                        onChange={() => {}}
                    />
                </div>
            ) : (
                <div className="border rounded-md">
                    <TipTapEditor
                        value={value}
                        onChange={(html: string) => onChange(html)}
                        placeholder="Fill in the planning template..."
                        addTableRow={addTableRowTrigger}
                    />
                </div>
            )}
        </div>
    );
}
