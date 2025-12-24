import { StudentReportData } from '@/types/student-analysis';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MyDialog } from '@/components/design-system/dialog';

interface StudentReportDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    report: StudentReportData | null;
    title?: string;
}

export const StudentReportDetailsDialog = ({
    open,
    onOpenChange,
    report,
    title = 'Analysis Report',
}: StudentReportDetailsDialogProps) => {
    if (!report) return null;

    const formatTitle = (key: keyof StudentReportData) => {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const KEYS = {
        STRENGTHS: 'strengths' as keyof StudentReportData,
        WEAKNESSES: 'weaknesses' as keyof StudentReportData,
        PROGRESS: 'progress' as keyof StudentReportData,
        LEARNING_FREQUENCY: 'learning_frequency' as keyof StudentReportData,
        TOPICS_IMPROVEMENT: 'topics_of_improvement' as keyof StudentReportData,
        TOPICS_DEGRADATION: 'topics_of_degradation' as keyof StudentReportData,
        REMEDIAL_POINTS: 'remedial_points' as keyof StudentReportData,
    };

    return (
        <MyDialog
            open={open}
            onOpenChange={onOpenChange}
            heading={title}
            dialogWidth="max-w-4xl"
            content={
                <div className="flex flex-col gap-4">
                    <ScrollArea className="h-[calc(90vh-160px)]">
                        {/* Adjusted height to account for new description and gap */}
                        <div className="p-0">
                            {/* Removed p-6 as MyDialog content already has padding */}
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="analysis">Deep Analysis</TabsTrigger>
                                    <TabsTrigger value="topics">Topics</TabsTrigger>
                                    <TabsTrigger value="remedial">Remedial</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    {formatTitle(KEYS.STRENGTHS)}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {Object.entries(
                                                    (report[KEYS.STRENGTHS] as Record<
                                                        string,
                                                        number
                                                    >) || {}
                                                ).map(([topic, score]) => (
                                                    <div key={topic} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">
                                                                {topic}
                                                            </span>
                                                            <span className="text-green-600">
                                                                {score}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={score}
                                                            className="h-2 bg-green-100 [&>div]:bg-green-500"
                                                        />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-lg">
                                                    {formatTitle(KEYS.WEAKNESSES)}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {Object.entries(
                                                    (report[KEYS.WEAKNESSES] as Record<
                                                        string,
                                                        number
                                                    >) || {}
                                                ).map(([topic, score]) => (
                                                    <div key={topic} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-medium">
                                                                {topic}
                                                            </span>
                                                            <span className="text-red-600">
                                                                {score}%
                                                            </span>
                                                        </div>
                                                        <Progress
                                                            value={score}
                                                            className="h-2 bg-red-100 [&>div]:bg-red-500"
                                                        />
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {formatTitle(KEYS.PROGRESS)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {report[KEYS.PROGRESS] as string}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="analysis" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {formatTitle(KEYS.LEARNING_FREQUENCY)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {report[KEYS.LEARNING_FREQUENCY] as string}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="topics" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-green-700">
                                                {formatTitle(KEYS.TOPICS_IMPROVEMENT)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {report[KEYS.TOPICS_IMPROVEMENT] as string}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-red-700">
                                                {formatTitle(KEYS.TOPICS_DEGRADATION)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {report[KEYS.TOPICS_DEGRADATION] as string}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="remedial" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                {formatTitle(KEYS.REMEDIAL_POINTS)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                                {report[KEYS.REMEDIAL_POINTS] as string}
                                            </ReactMarkdown>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </ScrollArea>
                </div>
            }
        />
    );
};
