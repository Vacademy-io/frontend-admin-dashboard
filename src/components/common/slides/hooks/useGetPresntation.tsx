/* eslint-disable */
// @ts-nocheck
import { TokenKey } from "@/constants/auth/tokens";
import { GET_BATCH_LIST } from "@/constants/urls";
import authenticatedAxiosInstance from "@/lib/auth/axiosInstance";
import { getTokenDecodedData, getTokenFromCookie } from "@/lib/auth/sessionUtility";
import { useQuery } from "@tanstack/react-query";
import { Presentation } from "../types";




  const initialPresentations: Presentation[] = [
    {
      id: "e281d727-08b7-487c-9662-d0e0eaa19700",
      title: "Introduction to Web Development",
      description: "A beginner-friendly presentation on the fundamentals of web development.",
      cover_file_id: "9d3443a4-9810-461c-8dc0-434ae2899a7",
      status: "published",
      createdAt: new Date().toISOString(),
      added_slides: [
        {
          id: "b93aa606-3f47-4201-ac18-0a8143d103bb",
          presentation_id: null,
          title: "What is Web Development?",
          source_id: null,
          source: "excalidraw",
          status: null,
          interaction_status: "",
          slide_order: 1,
          default_time: 60,
          content: "9d3443a4-9810-461c-8dc0-434ae2899a58",
          created_at: null,
          updated_at: null,
          added_question: null,
          updated_question: null,
        },
        {
          id: "4ec37e2a-eac2-4c1a-aa14-d2a0c44eff49",
          presentation_id: null,
          title: "What is Web Development?",
          source_id: "2cf93897-61cd-4573-a1a6-50f23c57d875",
          source: "question",
          status: null,
          interaction_status: "",
          slide_order: 2,
          default_time: 60,
          content: "Web development refers to the creation of websites and web applications.",
          created_at: null,
          updated_at: null,
          added_question: {
            id: "2cf93897-61cd-4573-a1a6-50f23c57d875",
          },
          updated_question: null,
        },
      ],
    },
    {
      id: "e281d727-08b7-487c-9662-d0e0eaa19701",
      title: "Introduction to Java",
      description: "A beginner-friendly presentation on the fundamentals of Java.",
      cover_file_id: "9d3443a4-9810-461c-8dc0-434ae2899a7",
      status: "published",
      createdAt: new Date().toISOString(),
      added_slides: [
        {
          id: "b93aa606-3f47-4201-ac18-0a8143d103bsb",
          presentation_id: null,
          title: "What is Web Development?",
          source_id: null,
          source: "excalidraw",
          status: null,
          interaction_status: "",
          slide_order: 1,
          default_time: 60,
          content: "9d3443a4-9810-461c-8dc0-434ae2899a58",
          created_at: null,
          updated_at: null,
          added_question: null,
          updated_question: null,
        },
        {
          id: "b93aa606-3f47-4201-ac18-0a8143d103bb",
          presentation_id: null,
          title: "What is Web Development?",
          source_id: null,
          source: "excalidraw",
          status: null,
          interaction_status: "",
          slide_order: 1,
          default_time: 60,
          content: "9d3443a4-9810-461c-8dc0-434ae2899a58",
          created_at: null,
          updated_at: null,
          added_question: null,
          updated_question: null,
        },
        {
          id: "4ec37e2a-eac2-4c1a-aa14-d2a0c44eff49",
          presentation_id: null,
          title: "What is Web Development?",
          source_id: "2cf93897-61cd-4573-a1a6-50f23c57d875",
          source: "question",
          status: null,
          interaction_status: "",
          slide_order: 2,
          default_time: 60,
          content: "Web development refers to the creation of websites and web applications.",
          created_at: null,
          updated_at: null,
          added_question: {
            id: "2cf93897-61cd-4573-a1a6-50f23c57d875",
          },
          updated_question: null,
        },
      ],
    },
  ]


export const fetchPresntation = async () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const response = await authenticatedAxiosInstance.get(GET_BATCH_LIST, {
        params: {
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
            return initialPresentations;
        },
        staleTime: 3600000,
       
    });
};

