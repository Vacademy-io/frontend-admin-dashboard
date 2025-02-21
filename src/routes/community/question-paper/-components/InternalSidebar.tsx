import { MyButton } from "@/components/design-system/button";

export function InternalSidebar() {
    return (
        <div className="flex w-[300px] flex-col justify-between border-r p-4">
            <div>
                <div className="size-full w-full rounded-md"></div>
                <div className="flex flex-col gap-2">
                    <div className="text-title font-bold">Title</div>
                    <div className="text-title font-bold">SubTitle</div>
                    <div>Tags will go here</div>
                </div>
                <div className="">
                    sub text content
                    <div></div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <MyButton buttonType="secondary">Add to Assessment</MyButton>
                <MyButton buttonType="secondary">Add to Favourites</MyButton>
                <MyButton buttonType="secondary">Share</MyButton>
                <MyButton>Self Practice</MyButton>
            </div>
        </div>
    );
}
