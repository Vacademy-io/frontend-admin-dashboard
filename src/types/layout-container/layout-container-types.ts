import { IconProps } from '@phosphor-icons/react';

export interface subItemsType {
    subItem: string | undefined;
    subItemLink: string | undefined;
    tabId: string;
}

export interface SidebarItemsType {
    icon: React.FC<IconProps>;
    title: string;
    to?: string;
    subItems?: subItemsType[];
    tabId: string;
    id: string;
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
