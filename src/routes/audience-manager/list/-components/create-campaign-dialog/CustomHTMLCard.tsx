import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { AudienceCampaignForm } from '../../-schema/AudienceCampaignSchema';
import { CodeSimple } from 'phosphor-react';
import { PPTViewQuillEditor } from '@/components/quill/PPTViewQuillEditor';

interface CustomHTMLCardProps {
    form: UseFormReturn<AudienceCampaignForm>;
}

const CustomHTMLCard = ({ form }: CustomHTMLCardProps) => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <CodeSimple size={22} />
                            <CardTitle className="text-2xl font-bold">Custom HTML</CardTitle>
                        </div>
                        <span className="text-sm text-gray-600">
                            Add custom HTML content to the invite page
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <PPTViewQuillEditor
                    value={form.watch('customHtml')}
                    onChange={(value: string) => form.setValue('customHtml', value)}
                    placeholder="Enter custom HTML code here..."
                    className="h-[100px]"
                />
            </CardContent>
        </Card>
    );
};

export default CustomHTMLCard;

