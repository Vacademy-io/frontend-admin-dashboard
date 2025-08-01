import React, { useState, useCallback, useRef } from 'react';
import type { Subject, Module, Chapter, Slide } from './courseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import './styles/DetailView.css';
import {
    Settings,
    User,
    Eye,
    Edit,
    Trash2,
    Save,
    Download,
    Upload,
    Play,
    Pause,
    Volume2,
    VolumeX,
    FileText,
    ExternalLink,
    CheckCircle,
    Clock,
    Star,
} from 'lucide-react';

// Types for the DetailView
interface DetailViewProps {
    selectedItem?: {
        type: 'subject' | 'module' | 'chapter' | 'slide';
        id: string;
        data: Subject | Module | Chapter | Slide;
    } | null;
}

type ViewMode = 'admin' | 'student';

// Sample content data for different slide types
const SAMPLE_CONTENT = {
    pdf: {
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        title: 'PDF Resource',
        pages: 10,
        size: '1.2 MB',
    },
    video: {
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'Video Lesson',
        duration: '10:00',
        views: 0,
    },
    document: {
        content: `# Reference Notes

This is a placeholder for reference material related to the selected topic.

Feel free to replace this content with detailed explanations, examples, or any supplementary information useful for learners.`,
        lastUpdated: '2024-01-01',
        readTime: '5 min read',
    },
    assessment: {
        title: 'Knowledge Check',
        questions: [
            {
                id: 1,
                question: 'Placeholder multiple-choice question?',
                type: 'multiple-choice',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct: 0,
            },
            {
                id: 2,
                question: 'Placeholder multi-select question (choose all that apply).',
                type: 'multiple-select',
                options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
                correct: [1, 2],
            },
            {
                id: 3,
                question: 'Open-ended placeholder question about this topic.',
                type: 'open-ended',
                placeholder: 'Write your answer here...',
            },
        ],
        timeLimit: 20,
        passingScore: 60,
        attempts: 2,
    },
};

const DetailView: React.FC<DetailViewProps> = ({ selectedItem }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('student');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');

    // PDF Viewer State
    const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
    const [pdfZoom, setPdfZoom] = useState(100);
    // (reverted) no local PDF upload state

    // Video Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState('0:00');

    // Assessment State
    const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: number]: any }>({});
    const [assessmentSubmitted, setAssessmentSubmitted] = useState(false);
    const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
    const [assessmentPassed, setAssessmentPassed] = useState<boolean>(false);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        if (selectedItem?.type === 'slide') {
            const slide = selectedItem.data as Slide;
            setEditContent(slide.name);
        }
    }, [selectedItem]);

    const handleSave = useCallback(() => {
        setIsEditing(false);
        // Here you would typically save to your backend
        console.log('Saving content:', editContent);
    }, [editContent]);

    const handleDelete = useCallback(() => {
        if (confirm('Are you sure you want to delete this item?')) {
            console.log('Deleting item:', selectedItem);
        }
    }, [selectedItem]);

    const renderViewModeToggle = () => (
        <div className="detail-view-header flex items-center justify-between">
            <div className="view-mode-toggle">
                <Button
                    variant={viewMode === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('admin')}
                    className="rounded-r-none"
                >
                    <Settings className="mr-2 size-4" />
                    Admin View
                </Button>
                <Button
                    variant={viewMode === 'student' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('student')}
                    className="rounded-l-none"
                >
                    <User className="mr-2 size-4" />
                    Student View
                </Button>
            </div>
            {/* Publish button (no functionality yet) */}
            <Button size="sm" className="ml-4">
                <Upload className="mr-2 size-4" />
                Publish
            </Button>
        </div>
    );

    const renderAdminControls = (slideType: string) => (
        <div className="admin-controls">
            <div className="admin-toolbar">
                <Button size="sm" variant="outline" onClick={handleEdit}>
                    <Edit className="mr-2 size-4" />
                    Edit
                </Button>
                <Button size="sm" variant="outline">
                    <Upload className="mr-2 size-4" />
                    Replace
                </Button>
                <Button size="sm" variant="outline">
                    <Download className="mr-2 size-4" />
                    Download
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                </Button>
            </div>
            <div className="admin-stats">
                <span className="stat-badge">Views: 245</span>
                <span className="stat-badge">Completion: 89%</span>
                <span className="stat-badge">Avg. Time: 5:30</span>
            </div>
        </div>
    );

    const renderPDFViewer = (slide: Slide) => {
        const content = SAMPLE_CONTENT.pdf;

        return (
            <div className="pdf-viewer">
                <div className="pdf-header">
                    <div className="pdf-info">
                        <h3>{content.title}</h3>
                        <div className="pdf-meta">
                            <span>{content.pages} pages</span>
                            <span>{content.size}</span>
                        </div>
                    </div>

                    {viewMode === 'admin' && renderAdminControls('pdf')}
                </div>

                <div className="pdf-toolbar">
                    <div className="pdf-navigation">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPdfCurrentPage(Math.max(1, pdfCurrentPage - 1))}
                        >
                            Previous
                        </Button>
                        <span className="page-info">
                            Page {pdfCurrentPage} of {content.pages}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setPdfCurrentPage(Math.min(content.pages, pdfCurrentPage + 1))
                            }
                        >
                            Next
                        </Button>
                    </div>

                    <div className="pdf-zoom">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPdfZoom(Math.max(50, pdfZoom - 25))}
                        >
                            -
                        </Button>
                        <span className="zoom-level">{pdfZoom}%</span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPdfZoom(Math.min(200, pdfZoom + 25))}
                        >
                            +
                        </Button>
                    </div>
                </div>

                <div className="pdf-content">
                    <iframe
                        src={`${content.url}#page=${pdfCurrentPage}&zoom=${pdfZoom}`}
                        width="100%"
                        height="600px"
                        title={content.title}
                        frameBorder="0"
                    />
                </div>
            </div>
        );
    };

    const renderVideoPlayer = (slide: Slide) => {
        const content = SAMPLE_CONTENT.video;

        return (
            <div className="video-player">
                <div className="video-header">
                    <div className="video-info">
                        <h3>{content.title}</h3>
                        <div className="video-meta">
                            <span>{content.duration}</span>
                            <span>{content.views} views</span>
                        </div>
                    </div>

                    {viewMode === 'admin' && renderAdminControls('video')}
                </div>

                <div className="video-content">
                    <iframe
                        width="100%"
                        height="400px"
                        src={content.url}
                        title={content.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                <div className="video-controls">
                    <div className="playback-controls">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsMuted(!isMuted)}>
                            {isMuted ? (
                                <VolumeX className="size-4" />
                            ) : (
                                <Volume2 className="size-4" />
                            )}
                        </Button>
                        <span className="current-time">
                            {currentTime} / {content.duration}
                        </span>
                    </div>

                    <div className="video-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '35%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDocumentViewer = (slide: Slide) => {
        const content = SAMPLE_CONTENT.document;

        return (
            <div className="document-viewer">
                <div className="document-header">
                    <div className="document-info">
                        <h3>Further Reading</h3>
                        <div className="document-meta">
                            <span>{content.readTime}</span>
                            <span>Updated: {content.lastUpdated}</span>
                        </div>
                    </div>

                    {viewMode === 'admin' && renderAdminControls('document')}
                </div>

                <div className="document-content">
                    {isEditing && viewMode === 'admin' ? (
                        <div className="edit-mode">
                            <Textarea
                                value={editContent || content.content}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="edit-textarea"
                                rows={20}
                            />
                            <div className="edit-actions">
                                <Button onClick={handleSave}>
                                    <Save className="mr-2 size-4" />
                                    Save Changes
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="document-prose">
                            <pre className="whitespace-pre-wrap font-sans">{content.content}</pre>
                        </div>
                    )}
                </div>

                <div className="document-actions">
                    <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 size-4" />
                        Open in New Tab
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 size-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        );
    };

    const renderAssessment = (slide: Slide) => {
        const content = SAMPLE_CONTENT.assessment;

        return (
            <div className="assessment-viewer">
                <div className="assessment-header">
                    <div className="assessment-info">
                        <h3>{content.title}</h3>
                        <div className="assessment-meta">
                            <span>Time Limit: {content.timeLimit} minutes</span>
                            <span>Passing Score: {content.passingScore}%</span>
                            <span>Attempts: {content.attempts}</span>
                        </div>
                    </div>

                    {viewMode === 'admin' && renderAdminControls('assessment')}
                </div>

                <div className="assessment-content">
                    {!assessmentSubmitted ? (
                        <div className="assessment-questions">
                            {content.questions.map((question, index) => (
                                <Card key={question.id} className="question-card">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Question {index + 1}: {question.question}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {question.type === 'multiple-choice' && (
                                            <div className="options">
                                                {question.options?.map((option, optIndex) => (
                                                    <label key={optIndex} className="option-label">
                                                        <input
                                                            type="radio"
                                                            name={`question-${question.id}`}
                                                            value={optIndex}
                                                            onChange={(e) =>
                                                                setAssessmentAnswers({
                                                                    ...assessmentAnswers,
                                                                    [question.id]: parseInt(
                                                                        e.target.value
                                                                    ),
                                                                })
                                                            }
                                                        />
                                                        <span>{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === 'multiple-select' && (
                                            <div className="options">
                                                {question.options?.map((option, optIndex) => (
                                                    <label key={optIndex} className="option-label">
                                                        <input
                                                            type="checkbox"
                                                            value={optIndex}
                                                            onChange={(e) => {
                                                                const currentAnswers =
                                                                    assessmentAnswers[
                                                                        question.id
                                                                    ] || [];
                                                                if (e.target.checked) {
                                                                    setAssessmentAnswers({
                                                                        ...assessmentAnswers,
                                                                        [question.id]: [
                                                                            ...currentAnswers,
                                                                            optIndex,
                                                                        ],
                                                                    });
                                                                } else {
                                                                    setAssessmentAnswers({
                                                                        ...assessmentAnswers,
                                                                        [question.id]:
                                                                            currentAnswers.filter(
                                                                                (a: number) =>
                                                                                    a !== optIndex
                                                                            ),
                                                                    });
                                                                }
                                                            }}
                                                        />
                                                        <span>{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {question.type === 'open-ended' && (
                                            <Textarea
                                                placeholder={question.placeholder}
                                                value={assessmentAnswers[question.id] || ''}
                                                onChange={(e) =>
                                                    setAssessmentAnswers({
                                                        ...assessmentAnswers,
                                                        [question.id]: e.target.value,
                                                    })
                                                }
                                                rows={4}
                                            />
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {viewMode === 'student' && (
                                <div className="assessment-actions">
                                    <Button
                                        onClick={() => {
                                            // calculate score
                                            const total = content.questions.length;
                                            let correct = 0;
                                            content.questions.forEach((q) => {
                                                const ans = assessmentAnswers[q.id];
                                                if (q.type === 'multiple-choice') {
                                                    if (ans === q.correct) correct += 1;
                                                } else if (q.type === 'multiple-select') {
                                                    if (
                                                        Array.isArray(q.correct) &&
                                                        Array.isArray(ans)
                                                    ) {
                                                        const aSet = new Set(ans);
                                                        const cSet = new Set(q.correct);
                                                        if (
                                                            aSet.size === cSet.size &&
                                                            [...aSet].every((v) => cSet.has(v))
                                                        ) {
                                                            correct += 1;
                                                        }
                                                    }
                                                }
                                            });
                                            const scorePct = Math.round((correct / total) * 100);
                                            setAssessmentScore(scorePct);
                                            setAssessmentPassed(scorePct >= content.passingScore);
                                            setAssessmentSubmitted(true);
                                        }}
                                        className="submit-assessment"
                                    >
                                        Submit Assessment
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="assessment-results">
                            <div className="results-header">
                                <CheckCircle className="size-8 text-green-500" />
                                <h3>Assessment Completed!</h3>
                            </div>
                            <div className="results-score">
                                <div className="score-circle">
                                    <span className="score-number">{assessmentScore ?? '--'}%</span>
                                    <span className="score-label">Score</span>
                                </div>
                            </div>
                            <div className="results-feedback">
                                {assessmentScore !== null &&
                                    (assessmentPassed ? (
                                        <p>Great job! You've passed the assessment.</p>
                                    ) : (
                                        <p>You did not reach the passing score. Try again!</p>
                                    ))}
                            </div>
                            <div className="results-actions">
                                <Button
                                    variant="outline"
                                    onClick={() => setAssessmentSubmitted(false)}
                                >
                                    Review Answers
                                </Button>
                                <Button>Continue to Next Lesson</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderSlideContent = (slide: Slide) => {
        switch (slide.type) {
            case 'pdf':
                return renderPDFViewer(slide);
            case 'video':
                return renderVideoPlayer(slide);
            case 'document':
                return renderDocumentViewer(slide);
            case 'assessment':
                return renderAssessment(slide);
            case 'youtube':
                return renderVideoPlayer(slide);
            case 'text':
            case 'code':
            case 'html':
            default:
                return (
                    <div className="default-content">
                        <Card>
                            <CardHeader>
                                <CardTitle>{slide.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>Content type: {slide.type}</p>
                                <p>This content type will be implemented soon.</p>
                                {viewMode === 'admin' && renderAdminControls(slide.type)}
                            </CardContent>
                        </Card>
                    </div>
                );
        }
    };

    const renderNonSlideContent = () => {
        if (!selectedItem) {
            return (
                <div className="empty-state">
                    <div className="empty-content">
                        <FileText className="mb-4 size-16 text-gray-400" />
                        <h3>Select an item to view details</h3>
                        <p>
                            Choose a course, module, chapter, or slide from the explorer to see its
                            content.
                        </p>
                    </div>
                </div>
            );
        }

        const { type, data } = selectedItem;

        return (
            <div className="info-view">
                <Card>
                    <CardHeader>
                        <div className="info-header">
                            <CardTitle className="capitalize">
                                {type}: {(data as any).name}
                            </CardTitle>
                            <span className="type-badge capitalize">{type}</span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="info-content">
                            {type === 'subject' && (
                                <div className="subject-info">
                                    <p>Course modules: {(data as Subject).modules.length}</p>
                                    <p>
                                        This course covers fundamental concepts and practical
                                        applications.
                                    </p>
                                </div>
                            )}

                            {type === 'module' && (
                                <div className="module-info">
                                    <p>Chapters: {(data as Module).chapters.length}</p>
                                    <p>
                                        This module provides structured learning with hands-on
                                        exercises.
                                    </p>
                                </div>
                            )}

                            {type === 'chapter' && (
                                <div className="chapter-info">
                                    <p>Slides: {(data as Chapter).slides.length}</p>
                                    <p>
                                        This chapter includes various learning materials and
                                        activities.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    // (reverted) no local PDF file selection handler

    return (
        <div className="detail-view">
            {renderViewModeToggle()}

            <div className="detail-content">
                {selectedItem?.type === 'slide'
                    ? renderSlideContent(selectedItem.data as Slide)
                    : renderNonSlideContent()}
            </div>
        </div>
    );
};

export default DetailView;
