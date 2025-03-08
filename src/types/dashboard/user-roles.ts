export interface UserRolesDataEntry {
    id: string;
    name: string;
    email: string;
    roleType: string[];
    status: string;
}

// Define the type for the entire data structure
export interface RolesDummyDataType {
    instituteUsers: UserRolesDataEntry[];
    invites: UserRolesDataEntry[];
}
