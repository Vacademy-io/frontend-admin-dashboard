import { getInstituteId } from '@/constants/helper';
import { InviteLinkFormValues } from '../GenerateInviteLinkSchema';
import { CustomField } from '../../../-schema/InviteFormSchema';

type ApiCourseData = {
    course: {
        id: string;
        package_name: string;
    };
    sessions: {
        session_dto: {
            id: string;
            session_name: string;
        };
        level_with_details: {
            id: string;
            name: string;
        }[];
    }[];
};

export function transformApiDataToDummyStructure(data: ApiCourseData[]) {
    const dummyCourses: { id: string; name: string }[] = [];
    const dummyBatches: Record<
        string,
        {
            sessionId: string;
            sessionName: string;
            levels: {
                levelId: string;
                levelName: string;
            }[];
        }[]
    > = {};

    data.forEach((courseItem) => {
        const courseId = courseItem.course.id;
        const courseName = courseItem.course.package_name;

        // Add to dummyCourses
        dummyCourses.push({
            id: courseId,
            name: courseName,
        });

        // Prepare sessions for dummyBatches
        const sessions = courseItem.sessions.map((sessionItem) => ({
            sessionId: sessionItem.session_dto.id,
            sessionName: sessionItem.session_dto.session_name,
            levels: sessionItem.level_with_details.map((lvl) => ({
                levelId: lvl.id,
                levelName: lvl.name,
            })),
        }));

        dummyBatches[courseId] = sessions;
    });

    return { dummyCourses, dummyBatches };
}

function transformCustomFields(customFields: CustomField[], instituteId: string) {
    const toSnakeCase = (str: string) =>
        str
            .trim()
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore between camelCase transitions
            .toLowerCase();

    return customFields.map((field, index) => {
        const isDropdown = field.type === 'dropdown';
        const options = isDropdown ? field.options?.map((opt) => opt.value).join(',') : '';

        return {
            id: '',
            institute_id: instituteId,
            type: field.type,
            type_id: '',
            custom_field: {
                guestId: '',
                id: '',
                fieldKey: toSnakeCase(field.name),
                fieldName: field.name,
                fieldType: field.type,
                defaultValue: '',
                config: isDropdown ? JSON.stringify({ coommaSepartedOptions: options }) : '',
                formOrder: index,
                isMandatory: field.isRequired,
                isFilter: true,
                isSortable: true,
                createdAt: '',
                updatedAt: '',
                sessionId: '',
                liveSessionId: '',
                customFieldValue: '',
            },
        };
    });
}

export function convertInviteData(data: InviteLinkFormValues) {
    const instituteId = getInstituteId();
    const jsonMetaData = {
        course: data.course,
        description: data.description,
        learningOutcome: data.learningOutcome,
        aboutCourse: data.aboutCourse,
        targetAudience: data.targetAudience,
        coursePreview: data.coursePreview,
        courseBanner: data.courseBanner,
        courseMedia: data.courseMedia,
        coursePreviewBlob: data.coursePreviewBlob,
        courseBannerBlob: data.courseBannerBlob,
        courseMediaBlob: data.courseMediaBlob,
        tags: data.tags,
        customHtml: data.customHtml,
        showRelatedCourses: data.showRelatedCourses,
    };
    const convertedData = {
        id: '',
        name: '',
        start_date: '',
        end_date: '',
        invite_code: '',
        status: 'ACTIVE',
        institute_id: instituteId,
        vendor: '',
        vendor_id: '',
        currency: '',
        tag: '',
        web_page_meta_data_json: JSON.stringify(jsonMetaData),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        institute_custom_fields: transformCustomFields(data.custom_fields, instituteId || ''),
        package_session_to_payment_options: [],
    };
    return convertedData;
}
