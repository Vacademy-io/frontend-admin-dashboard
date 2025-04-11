import { TokenKey } from "@/constants/auth/tokens";
import { GET_BATCH_LIST } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { batchesWithStudents } from "@/routes/students/manage-batches/-types/manage-batches-types";
import { useQuery } from "@tanstack/react-query";


// Sample presentation data
export interface Presentation {
  id: string
  title: string
  description: string
  createdAt: string
  status: "draft" | "published" | "archived"
  slides: number
  lastEdited?: string
  category?: string
}


const samplePresentations: Presentation[] = [
  {
    id: "1",
    title: "Introduction to React",
    description:
      "A comprehensive overview of React fundamentals and best practices for beginners and intermediate developers.",
    createdAt: "2023-10-15",
    status: "published",
    slides: 24,
    lastEdited: "2023-12-10",
    category: "Development",
  },
  {
    id: "2",
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into closures, prototypes, and asynchronous programming patterns in modern JavaScript.",
    createdAt: "2023-11-02",
    status: "published",
    slides: 18,
    lastEdited: "2024-01-05",
    category: "Development",
  },
  {
    id: "3",
    title: "UI/UX Design Principles",
    description:
      "Learn the core principles of effective user interface design and how to create engaging user experiences.",
    createdAt: "2023-12-05",
    status: "published",
    slides: 32,
    lastEdited: "2024-02-15",
    category: "Design",
  },
  {
    id: "4",
    title: "Data Structures & Algorithms",
    description:
      "Essential algorithms and data structures for technical interviews and practical programming applications.",
    createdAt: "2024-01-10",
    status: "published",
    slides: 42,
    lastEdited: "2024-03-01",
    category: "Computer Science",
  },
  {
    id: "5",
    title: "Machine Learning Fundamentals",
    description: "Introduction to key machine learning concepts, algorithms, and practical applications with Python.",
    createdAt: "2024-02-20",
    status: "published",
    slides: 36,
    lastEdited: "2024-03-15",
    category: "Data Science",
  },
  {
    id: "6",
    title: "Cloud Computing Architecture",
    description:
      "Overview of modern cloud infrastructure, services, and deployment strategies for scalable applications.",
    createdAt: "2024-03-05",
    status: "published",
    slides: 28,
    lastEdited: "2024-03-20",
    category: "Infrastructure",
  },
]

export const fetchPresntation = async ({ sessionId }: { sessionId: string }) => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const response = await authenticatedAxiosInstance.get(GET_BATCH_LIST, {
        params: {
            sessionId: sessionId,
            instituteId: INSTITUTE_ID,
        },
    });
    return response.data;
};

export const useGetPresntation = () => {
    return useQuery<Presentation[] | null>({
        queryKey: ["GET_PRESNTATIONS"],
        queryFn:  () => {
            // const response = fetchPresntation({ sessionId: sessionId });
            return samplePresentations;
        },
        staleTime: 3600000,
       
    });
};
