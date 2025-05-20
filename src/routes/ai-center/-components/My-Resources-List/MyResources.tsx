import { ResourcesCard } from './ResourcesCard';

interface FileDetail {
    id: string;
    url: string;
    file_name: string;
    file_type: string;
    created_on: string;
    source?: string;
    source_id?: string;
    expiry?: string;
    width?: number;
    height?: number;
    updated_on?: string;
}
interface TaskStatus {
    id: string;
    task_name?: string;
    institute_id?: string;
    status?: string;
    result_json?: string;
    input_id?: string;
    input_type?: string;
    created_at?: string;
    updated_at?: string;
    parent_id?: string | null;
    file_detail: FileDetail | null;
}
const MyResources = () => {
    // Example API response (you would fetch this in a real application)
    // This uses the structure from your curl command and includes variations for testing
    const exampleApiResponse: TaskStatus[] = [
        {
            id: '2622e741-3eb8-40d2-8e0a-bc0af73b04e6', // Task ID
            task_name: 'analyse lecture',
            institute_id: 'a871e4aa-d347-4107-afa2-4d7c2475edb3',
            status: 'COMPLETED',
            result_json: '{\n  "title": "Class 11 Physics - Chapter 1: Physical World", ... }', // Truncated
            input_id: '6dddecdd-4995-478d-a1d5-388d81b7932e',
            input_type: 'AUDIO_ID',
            created_at: '2025-05-12T12:14:33.592+00:00', // Task created_at
            updated_at: '2025-05-12T12:14:33.592+00:00', // Task updated_at
            parent_id: null,
            file_detail: {
                id: '4332c5ad-425f-4d0d-ba22-20f21fb0a288', // File ID
                url: 'https://vacademy-media-storage.s3.ap-south-1.amazonaws.com/a871e4aa-d347-4107-afa2-4d7c2475edb3/STUDENTS/77bc6705-f34e-4186-a623-c1de9b573372-class_11_physics_chapter_1___physical_world_-_what_is_physics_and_its_scope_-_complete_chapter.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250517T065442Z&X-Amz-SignedHeaders=host&X-Amz-Expires=86399&X-Amz-Credential=AKIA3ISBV4TNEO3NCERX%2F20250517%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Signature=c37e1f93a65070a14ec2ebf50c4a8d7590988275d595a74d83f7fa439f54484a',
                file_name: 'class_11_physics_chapter_1.mp3',
                file_type: 'audio/mpeg',
                source: 'a871e4aa-d347-4107-afa2-4d7c2475edb3',
                source_id: 'STUDENTS',
                expiry: '2025-05-18T06:54:42.123+00:00',
                width: 0.0,
                height: 0.0,
                created_on: '2025-05-12T12:14:29.530+00:00', // File created_on
                updated_on: '2025-05-12T12:14:29.530+00:00', // File updated_on
            },
        },
        {
            id: 'another-task-id-pdf',
            file_detail: {
                id: 'unique-file-id-pdf-1',
                url: 'https://example.com/lecture_notes_chapter_2.pdf',
                file_name: 'lecture_notes_chapter_2.pdf',
                file_type: 'application/pdf',
                created_on: '2025-05-15T10:00:00.000Z',
            },
        },
        {
            // This task references the same file as the first one (by file_detail.id), it should be de-duplicated
            id: 'yet-another-task-id-duplicate-file',
            file_detail: {
                id: '4332c5ad-425f-4d0d-ba22-20f21fb0a288', // Same file_detail.id as the first item
                url: 'https://vacademy-media-storage.s3.ap-south-1.amazonaws.com/...', // (same URL)
                file_name: 'class_11_physics_chapter_1.mp3', // (same name)
                file_type: 'audio/mpeg',
                created_on: '2025-05-12T12:14:29.530+00:00', // (same creation date)
            },
        },
        {
            // A newer file to test sorting (should appear first or high up)
            id: 'new-task-id-pptx',
            file_detail: {
                id: 'unique-file-id-pptx-1',
                url: 'https://example.com/presentation_slides_final.pptx',
                file_name: 'presentation_slides_final.pptx',
                file_type:
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                created_on: '2025-05-16T14:30:00.000Z',
            },
        },
        {
            // Task with no file detail, should be filtered out by processedFiles logic
            id: 'task-no-file',
            file_detail: null,
        },
        {
            // Task with file detail but missing URL, actions should be disabled
            id: 'task-file-no-url',
            file_detail: {
                id: 'file-id-no-url',
                url: '', // Explicitly null for testing
                file_name: 'file_with_no_url.txt',
                file_type: 'text/plain',
                created_on: '2025-05-10T10:00:00.000Z',
            },
        },
    ];
    // For fetching live data:
    // const [apiData, setApiData] = useState<TaskStatus[]>([]);
    // const [isLoading, setIsLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const response = await fetch('https://backend-stage.vacademy.io/media-service/task-status/get-all?instituteId=a871e4aa-d347-4107-afa2-4d7c2475edb3');
    //       if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //       }
    //       const data = await response.json();
    //       setApiData(data);
    //     } catch (e) {
    //       setError(e instanceof Error ? e.message : String(e));
    //       console.error("Error fetching data:", e);
    //     } finally {
    //       setIsLoading(false);
    //     }
    //   };
    //   fetchData();
    // }, []);
    // if (isLoading) return <p>Loading resources...</p>;
    // if (error) return <p>Error loading resources: {error}</p>;
    return <ResourcesCard apiResponse={exampleApiResponse} />;
};
export default MyResources;
