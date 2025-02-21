import { MyButton } from "@/components/design-system/button";

export function Question() {
    return (
        <div className="flex flex-1 flex-col bg-sidebar-background p-6">
            <div className="flex flex-row items-center justify-between">
                <div>
                    <div className="text-subtitle">Question number</div>
                    <div className="text-body">Question</div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    <MyButton buttonType="secondary" scale="small">
                        2 mark
                    </MyButton>
                    <div className="text-body text-primary-400">min</div>
                    <div className="size-4 border text-body"></div>
                </div>
            </div>
        </div>
    );
}
