export enum TokenKey {
    accessToken = "accessToken",
    refreshToken = "refreshToken",
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface Role {
    name: string;
    createdTime: string;
    displayName: string;
    description?: string;
    users: string[];
    groups: string[];
    roles: string[];
    domains: string[];
    isEnabled: boolean;
}

export interface IAccessToken {
    owner: string;
    name: string;
    avatar: string;
    roles: Role[];
}
