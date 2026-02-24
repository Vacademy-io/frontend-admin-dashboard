import { SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarItemProps } from '../../../../types/layout-container/layout-container-types';
import { useSidebar } from '@/components/ui/sidebar';
import { CollapsibleItem } from './collapsible-item';
import { NonCollapsibleItem } from './non-collapsible-item';

export const SidebarItem = ({ icon, title, to, subItems, locked, category }: SidebarItemProps) => {
    const { state } = useSidebar();

    return (
        <SidebarMenuItem className={`${state == 'expanded' ? 'w-full px-3' : 'w-fit'}`}>
            {subItems ? (
                <CollapsibleItem
                    icon={icon}
                    title={title}
                    to={to}
                    subItems={subItems}
                    locked={locked}
                    category={category}
                />
            ) : (
                <NonCollapsibleItem
                    icon={icon}
                    title={title}
                    to={to}
                    locked={locked}
                    category={category}
                />
            )}
        </SidebarMenuItem>
    );
};
