import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import { InviteLinkFormValues, relatedCourses } from '../GenerateInviteLinkSchema';
import { Switch as ShadSwitch } from '@/components/ui/switch';

interface InviteViaEmailCardProps {
    form: UseFormReturn<InviteLinkFormValues>;
}

const ShowRelatedCoursesCard = ({ form }: InviteViaEmailCardProps) => {
    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Include Related Courses</CardTitle>
                <span className="text-sm text-gray-600">
                    Show related courses to students on the invite page
                </span>
            </CardHeader>
            <CardContent>
                <div className="mt-2 flex items-center gap-3">
                    <ShadSwitch
                        checked={form.watch('showRelatedCourses')}
                        onCheckedChange={(value) => form.setValue('showRelatedCourses', value)}
                    />
                    <span className="text-sm text-gray-700">
                        Show related courses on invite page
                    </span>
                </div>
                {form.watch('showRelatedCourses') && (
                    <>
                        <hr className="my-4 border-t border-gray-200" />
                        <p className="mb-4">Related Courses</p>
                        <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {relatedCourses.map((course) => (
                                <Card
                                    key={course.id}
                                    className="flex flex-row items-center gap-4 border border-gray-200 p-3 shadow-none"
                                >
                                    <img
                                        src={course.image}
                                        alt={course.name}
                                        className="size-12 rounded border border-gray-200 bg-gray-100 object-cover"
                                    />
                                    <div className="flex flex-1 flex-row items-center">
                                        <div className="flex flex-1 flex-col">
                                            <div className="text-base font-semibold">
                                                {course.name}
                                            </div>
                                            <div className="mb-1 text-sm text-gray-600">
                                                {course.description}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex flex-wrap items-center justify-end gap-1">
                                            {course.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-xl bg-gray-100 px-3 py-1 text-xs font-bold"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">
                            These courses will be displayed as suggestions on the invite page to
                            encourage additional enrollments.
                        </span>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ShowRelatedCoursesCard;
