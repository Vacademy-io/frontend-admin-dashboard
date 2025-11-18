import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileText,
    Notepad,
    Exam,
    Presentation,
    VideoCamera,
    Cards,
    BookOpen,
    PencilSimple,
} from 'phosphor-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContentTabsProps {
    transcription?: string;
}

export function ContentTabs({ transcription }: ContentTabsProps) {
    const tabs = [
        {
            id: 'transcription',
            label: 'Transcription',
            icon: FileText,
            description: 'Full text transcription of the audio',
        },
        {
            id: 'summary',
            label: 'Summary',
            icon: Notepad,
            description: 'AI-generated summary of key points',
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: BookOpen,
            description: 'Structured notes from the content',
        },
        {
            id: 'quiz',
            label: 'Quiz',
            icon: Exam,
            description: 'Auto-generated quiz questions',
        },
        {
            id: 'slides',
            label: 'Slides',
            icon: Presentation,
            description: 'Presentation slides outline',
        },
        {
            id: 'videos',
            label: 'Video Ideas',
            icon: VideoCamera,
            description: 'Video content suggestions',
        },
        {
            id: 'flashcards',
            label: 'Flashcards',
            icon: Cards,
            description: 'Study flashcards',
        },
        {
            id: 'homework',
            label: 'Homework',
            icon: PencilSimple,
            description: 'Homework assignment ideas',
        },
        {
            id: 'classwork',
            label: 'Classwork',
            icon: BookOpen,
            description: 'In-class activity ideas',
        },
    ];

    return (
        <Tabs defaultValue="transcription" className="w-full">
            <ScrollArea className="w-full">
                <TabsList className="w-full justify-start">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
                                <Icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
            </ScrollArea>

            {/* Transcription Tab */}
            <TabsContent value="transcription" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText size={20} />
                            Transcription
                        </CardTitle>
                        <CardDescription>Full text transcription of the audio</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transcription ? (
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{transcription}</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                                <p>Transcription will appear here once processing is complete.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Summary Tab */}
            <TabsContent value="summary" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Notepad size={20} />
                            Summary
                        </CardTitle>
                        <CardDescription>AI-generated summary of key points</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <Notepad size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: AI-generated summary</p>
                            <p className="text-xs mt-2">This feature will automatically summarize the main points from your audio.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen size={20} />
                            Notes
                        </CardTitle>
                        <CardDescription>Structured notes from the content</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Structured notes</p>
                            <p className="text-xs mt-2">AI will extract and organize key information into structured notes.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Exam size={20} />
                            Quiz
                        </CardTitle>
                        <CardDescription>Auto-generated quiz questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <Exam size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Auto-generated quiz</p>
                            <p className="text-xs mt-2">AI will create quiz questions based on the content.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Slides Tab */}
            <TabsContent value="slides" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Presentation size={20} />
                            Slides
                        </CardTitle>
                        <CardDescription>Presentation slides outline</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <Presentation size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Slide outlines</p>
                            <p className="text-xs mt-2">Generate presentation slides from your content.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Video Ideas Tab */}
            <TabsContent value="videos" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <VideoCamera size={20} />
                            Video Ideas
                        </CardTitle>
                        <CardDescription>Video content suggestions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <VideoCamera size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Video ideas</p>
                            <p className="text-xs mt-2">Get suggestions for video content based on the audio.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Flashcards Tab */}
            <TabsContent value="flashcards" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cards size={20} />
                            Flashcards
                        </CardTitle>
                        <CardDescription>Study flashcards</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <Cards size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Flashcards</p>
                            <p className="text-xs mt-2">Create study flashcards from key concepts.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Homework Tab */}
            <TabsContent value="homework" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PencilSimple size={20} />
                            Homework Ideas
                        </CardTitle>
                        <CardDescription>Homework assignment ideas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <PencilSimple size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Homework ideas</p>
                            <p className="text-xs mt-2">Get homework assignment suggestions based on the content.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Classwork Tab */}
            <TabsContent value="classwork" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen size={20} />
                            Classwork Ideas
                        </CardTitle>
                        <CardDescription>In-class activity ideas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-gray-500">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Coming soon: Classwork ideas</p>
                            <p className="text-xs mt-2">Get in-class activity suggestions based on the content.</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}


