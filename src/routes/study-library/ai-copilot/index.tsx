import { LayoutContainer } from '@/components/common/layout-container/layout-container';
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet';
import { useState } from 'react';
import { MyButton } from '@/components/design-system/button';
import { MyInput } from '@/components/design-system/input';

export const Route = createFileRoute('/study-library/ai-copilot/')({
    component: RouteComponent,
});

function RouteComponent() {
    const [prompt, setPrompt] = useState('');

    const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrompt(e.target.value);
    };

    const handleGenerateCourse = () => {
        // For now, just log the prompt - this will be implemented later
        console.log('Generating course with prompt:', prompt);
        alert(`Course generation started with prompt: "${prompt}"`);
    };

    return (
        <LayoutContainer>
            <Helmet>
                <title>AI Course Copilot</title>
                <meta
                    name="description"
                    content="Create courses with AI assistance using natural language prompts."
                />
            </Helmet>

            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-neutral-900">AI Course Copilot</h1>
                    <p className="text-neutral-600">
                        Describe your course idea in natural language and let AI help you create it.
                    </p>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-neutral-700">
                                What course would you like to create?
                            </label>
                            <MyInput
                                inputType="text"
                                inputPlaceholder="e.g., Create a comprehensive Python programming course for beginners covering variables, loops, functions, and basic data structures..."
                                input={prompt}
                                onChangeFunction={handlePromptChange}
                                className="w-full"
                                size="large"
                            />
                        </div>

                        <div className="flex justify-end">
                            <MyButton
                                buttonType="primary"
                                scale="large"
                                onClick={handleGenerateCourse}
                                disabled={!prompt.trim()}
                                className="font-medium"
                            >
                                Generate Course
                            </MyButton>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-sm text-neutral-500">
                    <h3 className="mb-2 font-medium">Tips for better results:</h3>
                    <ul className="list-inside list-disc space-y-1">
                        <li>Be specific about the subject and target audience</li>
                        <li>Include learning objectives or key topics to cover</li>
                        <li>Mention the course level (beginner, intermediate, advanced)</li>
                        <li>Specify any prerequisites or required background knowledge</li>
                    </ul>
                </div>
            </div>
        </LayoutContainer>
    );
}
