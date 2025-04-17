/* eslint-disable */
// @ts-nocheck
import { TokenKey } from "@/constants/auth/tokens";
import { GET_BATCH_LIST, GET_PRESENTATION_LIST } from "@/constants/urls";
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
      added_slides:null,
    },
    {
      id: "e281d727-08b7-487c-9662-d0e0eaa19701",
      title: "Introduction to Java",
      description: "A beginner-friendly presentation on the fundamentals of Java.",
      cover_file_id: "9d3443a4-9810-461c-8dc0-434ae2899a7",
      status: "published",
      createdAt: new Date().toISOString(),
      added_slides:null,
    },
  ]


export const fetchPresntation = async () => {
    const accessToken = getTokenFromCookie(TokenKey.accessToken);
    const tokenData = getTokenDecodedData(accessToken);
    const INSTITUTE_ID = tokenData && Object.keys(tokenData.authorities)[0];
    const response = await authenticatedAxiosInstance.get(GET_PRESENTATION_LIST, {
        params: {
            instituteId: INSTITUTE_ID,
        },
    });
    return response.data;
};

export const useGetPresntation = () => {
    return useQuery<Presentation[] | null>({
        queryKey: ["GET_PRESNTATIONS"],
        queryFn: async () => {
            const response =await fetchPresntation();
            return response;
        },
        staleTime:0,
       
    });
};

