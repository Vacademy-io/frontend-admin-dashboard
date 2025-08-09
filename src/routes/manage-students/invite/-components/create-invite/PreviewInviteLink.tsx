import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Award, Target, Info, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MyButton } from '@/components/design-system/button';
import { Eye } from 'phosphor-react';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues } from './GenerateInviteLinkSchema';

export interface PreviewInviteLinkProps {
    form: UseFormReturn<InviteLinkFormValues>;
    levelName: string;
    instituteLogo: string;
}

// Utility to extract YouTube video ID
const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1] && match[1].length === 11 ? match[1] : null;
};

const PreviewInviteLink = ({ form, levelName, instituteLogo }: PreviewInviteLinkProps) => {
    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <MyButton
                        type="button"
                        scale="small"
                        buttonType="secondary"
                        className="mr-4 p-4 py-5"
                    >
                        <Eye size={32} />
                        Preview Invite
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="mx-auto max-h-[90vh] w-full space-y-8 overflow-y-auto md:max-w-[80%]">
                    <Card className="w-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm">
                        {/* Instiute Logo */}
                        {instituteLogo && (
                            <div className="flex items-center justify-center rounded-lg pt-8">
                                <img
                                    src={instituteLogo}
                                    alt="Institute Logo"
                                    className="size-12 rounded-full"
                                />
                            </div>
                        )}
                        {/* Banner Image */}
                        <div className="rounded-lg p-8 !pb-0">
                            {form.getValues('courseBannerBlob') ? (
                                <div className="relative h-32 w-full overflow-hidden rounded-xl sm:h-56 lg:h-72">
                                    <img
                                        src={form.getValues('courseBannerBlob')}
                                        alt="Course Banner"
                                        className="size-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="relative h-32 w-full overflow-hidden rounded-xl bg-primary-500 sm:h-56 lg:h-72"></div>
                            )}
                        </div>
                        <CardContent className="p-6 sm:p-8">
                            {/* Course Name */}
                            <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                <BookOpen className="mt-0.5 size-5 shrink-0 text-blue-600 sm:size-6" />
                                <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                    {form.getValues('course')}
                                </h2>
                            </div>
                            {/* Tags Row */}
                            {form.getValues('tags')?.length > 0 && (
                                <div className="mb-6 flex flex-wrap gap-2">
                                    {form.getValues('tags')?.map((tag: string, index: number) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 transition-colors hover:bg-blue-200"
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            {/* Course Description */}
                            <p
                                className="mb-6 text-base leading-relaxed text-gray-700 sm:text-lg"
                                dangerouslySetInnerHTML={{
                                    __html: form.getValues('description') || '',
                                }}
                            />

                            {/* Level Badge */}
                            <div className="mb-8 flex items-start gap-2">
                                <Award className="mt-0.5 size-5 shrink-0 text-amber-500" />
                                <Badge
                                    variant="outline"
                                    className="border-amber-200 px-3 py-1 text-sm font-medium text-amber-700"
                                >
                                    Level:&nbsp;{levelName}
                                </Badge>
                            </div>

                            <Separator className="my-8" />

                            {/* What Learners Will Gain Section */}
                            {form.getValues('learningOutcome') && (
                                <div className="mb-8">
                                    <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                        <Target className="mt-0.5 size-5 shrink-0 text-green-600 sm:size-6" />
                                        <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                            What Learners Will Gain
                                        </h2>
                                    </div>
                                    <div className="grid gap-3">
                                        <p
                                            className="text-sm text-gray-700 sm:text-base"
                                            dangerouslySetInnerHTML={{
                                                __html: form.getValues('learningOutcome') || '',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {form.getValues('coursePreviewBlob') && (
                                <div className="flex items-center justify-center rounded-lg pt-8">
                                    <img
                                        src={form.getValues('coursePreviewBlob')}
                                        alt="Course Preview Image"
                                        className="w-fit"
                                    />
                                </div>
                            )}

                            <Separator className="my-8" />

                            {/* About the Course Section */}
                            {form.getValues('aboutCourse') && (
                                <div className="mb-8">
                                    <div className="mb-4 flex items-start gap-2 sm:gap-3">
                                        <Info className="mt-0.5 size-5 shrink-0 text-blue-600 sm:size-6" />
                                        <h2 className="text-lg font-semibold leading-tight text-gray-900 sm:text-xl md:text-2xl">
                                            About the Course
                                        </h2>
                                    </div>
                                    <p
                                        className="text-sm leading-relaxed text-gray-700 sm:text-base"
                                        dangerouslySetInnerHTML={{
                                            __html: form.getValues('aboutCourse') || '',
                                        }}
                                    />
                                </div>
                            )}

                            {/* Right side - Video Player - More Compact */}
                            {form.getValues('courseMedia')?.id &&
                                (form.getValues('courseMedia')?.type === 'youtube' ? (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-black">
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${extractYouTubeVideoId(form.getValues('courseMedia')?.id || '')}`}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : form.getValues('courseMedia')?.type === 'video' ? (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                            <video
                                                src={form.getValues('courseMediaBlob')}
                                                controls
                                                controlsList="nodownload noremoteplayback"
                                                disablePictureInPicture
                                                disableRemotePlayback
                                                className="size-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement?.classList.add(
                                                        'bg-black'
                                                    );
                                                }}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className={`shrink-0 overflow-hidden rounded-lg shadow-lg`}
                                    >
                                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                                            <img
                                                src={form.getValues('courseMediaBlob')}
                                                alt="Course Banner"
                                                className="size-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ))}
                        </CardContent>
                    </Card>
                    {form.getValues('customHtml') && (
                        <Card
                            id="registration-card"
                            className="w-full overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm"
                        >
                            <CardContent className="p-6 sm:p-8">
                                <div className="mb-6 flex items-start gap-2 sm:gap-3">
                                    <div
                                        className="h-full w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: form.getValues('customHtml') || '',
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PreviewInviteLink;
