import { IconProps } from '@phosphor-icons/react';

export interface subItemsType {
    subItem: string | undefined;
    subItemLink: string | undefined;
    subItemId: string;
    adminOnly?: boolean;
}

export interface SidebarItemsType {
    icon: React.FC<IconProps>;
    title: string;
    to?: string;
    subItems?: subItemsType[];
    id: string;
    showForInstitute?: string;
}
export interface SidebarItemProps {
    icon?: React.FC<IconProps>;
    title: string;
    to?: string;
    subItems?: subItemsType[];
    selectedItem?: string;
}

export interface SidebarStateType {
    state: string;
}
