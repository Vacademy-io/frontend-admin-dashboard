import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import React from "react";
import { SidebarGroup } from "@/components/ui/sidebar";
import { SidebarItemProps } from "../types";
import { useSidebar } from "@/components/ui/sidebar";
import { usePageStore } from "@/stores/usePageStore";
import { Link } from "@tanstack/react-router";

export const CollapsibleItem = ({ icon, title, subItems }: SidebarItemProps) => {
    const [hover, setHover] = useState<boolean>(false);
    // const [isSelectedInSubItems, setIsSelectedInSubItems] = useState(false);
    const { currentPage, setCurrentPage } = usePageStore();
    const { state, toggleSidebar } = useSidebar(); // Access sidebar state and toggle function

    const toggleHover = () => setHover(!hover);

    // Track if selectedItem is within subItems
    // useEffect(() => {
    //     if (subItems) {
    //         setIsSelectedInSubItems(subItems.some((item) => item.subItem === selectedItem));
    //     }
    // }, [selectedItem, subItems]);

    const [isMatchingCurrentPage, setIsMatchingCurrentPage] = useState<boolean | undefined>(false);

    useEffect(() => {
        const matches = subItems?.some((item) => item.subItemLink === currentPage.path);
        setIsMatchingCurrentPage(matches);
    }, [currentPage, subItems]);

    return (
        <Collapsible
            className="group/collapsible"
            onMouseEnter={toggleHover}
            onMouseLeave={toggleHover}
        >
            <CollapsibleTrigger
                className="flex w-full items-center justify-between"
                onClick={() => {
                    if (state === "collapsed") toggleSidebar(); // Open sidebar if it’s collapsed
                }}
            >
                <div
                    className={`flex w-full cursor-pointer items-center gap-1 rounded-lg px-4 py-2 ${
                        hover || isMatchingCurrentPage ? "bg-white" : "bg-none"
                    }`}
                >
                    <div className="flex items-center">
                        {icon &&
                            React.createElement(icon, {
                                className: `${state === "expanded" ? "size-7" : "size-6"} ${
                                    hover || isMatchingCurrentPage
                                        ? "text-primary-500"
                                        : "text-neutral-400"
                                }`,
                                weight: "fill",
                            })}
                        <SidebarGroup
                            className={`${
                                hover || isMatchingCurrentPage
                                    ? "text-primary-500"
                                    : "text-neutral-600"
                            } text-body font-regular group-data-[collapsible=icon]:hidden`}
                        >
                            {title}
                        </SidebarGroup>
                    </div>
                    <SidebarGroup className="ml-auto w-fit group-data-[collapsible=icon]:hidden">
                        <ChevronDownIcon
                            className={`ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 ${
                                hover || isMatchingCurrentPage
                                    ? "text-primary-500"
                                    : "text-neutral-600"
                            }`}
                        />
                    </SidebarGroup>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <SidebarGroup className="flex flex-col gap-1 pl-12 group-data-[collapsible=icon]:hidden">
                    {subItems?.map((obj, key) => (
                        <Link to={obj.subItemLink} key={key}>
                            <div
                                className={`cursor-pointer text-body font-regular text-neutral-600 hover:text-primary-500 ${
                                    currentPage.path === obj.subItemLink
                                        ? "text-primary-500"
                                        : "text-neutral-600"
                                }`}
                                onClick={() => setCurrentPage(obj.subItem, obj.subItemLink)}
                            >
                                {obj.subItem}
                            </div>
                        </Link>
                    ))}
                </SidebarGroup>
            </CollapsibleContent>
        </Collapsible>
    );
};
