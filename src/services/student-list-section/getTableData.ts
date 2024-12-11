// import { tableType } from "../../schemas/student-list/table-schema";
// import { useMutation } from "@tanstack/react-query";
// import { StudentFilterRequest } from "../../schemas/student-list/table-schema";

// type QueryParamsType = {
//     pageNo: number;
//     pageSize: number;
// };

// type bodyType = {
//     session: string[];
//     batches: string[];
//     status: string[];
//     gender: string[];
//     session_expiry: string[];
// };

// type ResponseType = {
//     content: tableType[];
//     last: boolean;
//     page_no: number;
//     page_size: number;
//     total_elements: number;
//     total_pages: number;
// };

// const tableData = async (queryParams: QueryParamsType, body: bodyType): Promise<ResponseType> => {
//     return new Promise<ResponseType>((resolve, reject) => {
//         try {
//             setTimeout(() => {
//                 if (!TableDummyData) {
//                     reject(new Error("No data available"));
//                 }
//                 resolve({
//                     content: TableDummyData,
//                     last: false,
//                     page_no: queryParams.pageNo,
//                     page_size: queryParams.pageSize,
//                     total_elements: 116,
//                     total_pages: 12,
//                 });
//             }, 1000);
//         } catch (error) {
//             console.log(body);
//             reject(error);
//         }
//     });
// };

// export const useTableData = () => {
//     return useMutation({
//         mutationFn: async (variables: { queryParams: QueryParamsType; body: bodyType }) => {
//             try {
//                 const response = await tableData(variables.queryParams, variables.body);
//                 return response;
//             } catch (error) {
//                 console.error("Mutation error:", error);
//                 throw error;
//             }
//         },
//     });
// };

// const TableDummyData: tableType[] = [
//     {
//         id: "1",
//         studentName: "John Doe",
//         batch: "10th Premium Pro Group 1",
//         enrollmentNumber: "EN001",
//         collegeSchool: "ABC University",
//         gender: "Male",
//         mobileNumber: "1234567890",
//         emailId: "john.doe@email.com",
//         fatherName: "James Doe",
//         motherName: "Jane Doe",
//         guardianName: "James Doe",
//         guardianNumber: "9876543210",
//         guardianEmail: "james.doe@email.com",
//         city: "New York",
//         state: "NY",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "2",
//         studentName: "Sarah Smith",
//         batch: "10th Premium Pro Group 2",
//         enrollmentNumber: "EN002",
//         collegeSchool: "XYZ College",
//         gender: "Female",
//         mobileNumber: "2345678901",
//         emailId: "sarah.smith@email.com",
//         fatherName: "Mike Smith",
//         motherName: "Lisa Smith",
//         guardianName: "Mike Smith",
//         guardianNumber: "8765432109",
//         guardianEmail: "mike.smith@email.com",
//         city: "Los Angeles",
//         state: "CA",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "3",
//         studentName: "Michael Johnson",
//         batch: "10th Premium Pro Group 2",
//         enrollmentNumber: "EN003",
//         collegeSchool: "PQR Institute",
//         gender: "Male",
//         mobileNumber: "3456789012",
//         emailId: "michael.j@email.com",
//         fatherName: "Robert Johnson",
//         motherName: "Mary Johnson",
//         guardianName: "Robert Johnson",
//         guardianNumber: "7654321098",
//         guardianEmail: "robert.j@email.com",
//         city: "Chicago",
//         state: "IL",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "4",
//         studentName: "Emily Brown",
//         batch: "9th Premium Plus Group 1",
//         enrollmentNumber: "EN004",
//         collegeSchool: "LMN College",
//         gender: "Female",
//         mobileNumber: "4567890123",
//         emailId: "emily.b@email.com",
//         fatherName: "David Brown",
//         motherName: "Susan Brown",
//         guardianName: "David Brown",
//         guardianNumber: "6543210987",
//         guardianEmail: "david.b@email.com",
//         city: "Houston",
//         state: "TX",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "5",
//         studentName: "John Doe",
//         batch: "9th Premium Plus Group 1",
//         enrollmentNumber: "EN001",
//         collegeSchool: "ABC University",
//         gender: "Male",
//         mobileNumber: "1234567890",
//         emailId: "john.doe@email.com",
//         fatherName: "James Doe",
//         motherName: "Jane Doe",
//         guardianName: "James Doe",
//         guardianNumber: "9876543210",
//         guardianEmail: "james.doe@email.com",
//         city: "New York",
//         state: "NY",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "6",
//         studentName: "Sarah Smith",
//         batch: "9th Premium Plus Group 1",
//         enrollmentNumber: "EN002",
//         collegeSchool: "XYZ College",
//         gender: "Female",
//         mobileNumber: "2345678901",
//         emailId: "sarah.smith@email.com",
//         fatherName: "Mike Smith",
//         motherName: "Lisa Smith",
//         guardianName: "Mike Smith",
//         guardianNumber: "8765432109",
//         guardianEmail: "mike.smith@email.com",
//         city: "Los Angeles",
//         state: "CA",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
//     {
//         id: "7",
//         studentName: "Michael Johnson",
//         batch: "10th Premium Plus Group 2",
//         enrollmentNumber: "EN003",
//         collegeSchool: "PQR Institute",
//         gender: "Male",
//         mobileNumber: "3456789012",
//         emailId: "michael.j@email.com",
//         fatherName: "Robert Johnson",
//         motherName: "Mary Johnson",
//         guardianName: "Robert Johnson",
//         guardianNumber: "7654321098",
//         guardianEmail: "robert.j@email.com",
//         city: "Chicago",
//         state: "IL",
//         sessionExpiry: "2024-12-31",
//         status: "active",
//     },
// ];
