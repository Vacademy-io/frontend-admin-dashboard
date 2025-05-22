import { MyButton } from '@/components/design-system/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from '@/components/ui/sidebar';
import { ArrowUp, X } from '@phosphor-icons/react';
import { Dispatch, SetStateAction, useState } from 'react';
import { doubtListDummy } from './dummy-data/doubt-list';
import { Doubt } from './doubt';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainViewQuillEditor } from '@/components/quill/MainViewQuillEditor';

export const DoubtResolutionSidebar = ({
    setDoubtProgressMarkerPdf,
    setDoubtProgressMarkerVideo,
}: {
    setDoubtProgressMarkerPdf: Dispatch<SetStateAction<number | null>>;
    setDoubtProgressMarkerVideo: Dispatch<SetStateAction<number | null>>;
}) => {
    const { open, setOpen } = useSidebar();
    const [showInput, setShowInput] = useState<boolean>(false);
    const [doubt, setDoubt] = useState<string>('');

    return (
        // <SidebarProvider >
        <Sidebar
            side="right"
            className={`${open ? 'w-[50vw]' : 'w-0'} flex flex-col gap-6 overflow-y-hidden bg-white p-4`}
        >
            <SidebarHeader className="flex w-full items-center justify-between overflow-y-hidden bg-white">
                <div className="flex w-full items-center justify-between bg-white">
                    <h1 className="text-lg font-semibold text-primary-500 sm:text-2xl">
                        Doubt Resolution
                    </h1>
                    <X className="hover:cursor-pointer" onClick={() => setOpen(false)} />
                </div>
            </SidebarHeader>
            <SidebarContent className="no-scrollbar flex flex-col gap-4 overflow-y-scroll bg-white pt-6">
                <Tabs defaultValue="All">
                    <TabsList className="flex w-full rounded-none border-b border-neutral-300 bg-white p-0">
                        <TabsTrigger
                            value="All"
                            className="w-full rounded-none rounded-t-md border-x border-t border-white pt-2 data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 data-[state=active]:shadow-none"
                        >
                            All
                        </TabsTrigger>
                        <TabsTrigger
                            value="Resolved"
                            className="w-full rounded-none rounded-t-md border-x border-t border-white pt-2 data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 data-[state=active]:shadow-none"
                        >
                            Resolved
                        </TabsTrigger>
                        <TabsTrigger
                            value="Unresolved"
                            className="w-full rounded-none rounded-t-md border-x border-t border-white pt-2 data-[state=active]:border-primary-200 data-[state=active]:text-primary-500 data-[state=active]:shadow-none"
                        >
                            Unresolved
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="All">
                        {doubtListDummy.map((doubt, key) => (
                            <Doubt
                                doubt={doubt}
                                key={key}
                                setDoubtProgressMarkerPdf={setDoubtProgressMarkerPdf}
                                setDoubtProgressMarkerVideo={setDoubtProgressMarkerVideo}
                            />
                        ))}
                    </TabsContent>
                </Tabs>
            </SidebarContent>
            <SidebarFooter className="flex w-full items-center justify-center bg-white sm:py-0">
                {showInput ? (
                    <div className=" flex w-full items-center gap-2 rounded-md p-3">
                        <MainViewQuillEditor
                            value={doubt}
                            onChange={setDoubt}
                            CustomclasssName="mb-16 h-[80px] w-full max-sm:h-[50px] sm:mb-10"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <MyButton layoutVariant="icon">
                                <ArrowUp />
                            </MyButton>
                            <MyButton
                                layoutVariant="icon"
                                buttonType="secondary"
                                onClick={() => setShowInput(false)}
                            >
                                <X />
                            </MyButton>
                        </div>
                    </div>
                ) : (
                    <MyButton scale="large" onClick={() => setShowInput(true)}>
                        Ask Doubt
                    </MyButton>
                )}
            </SidebarFooter>
        </Sidebar>
        // </SidebarProvider>
    );
};
