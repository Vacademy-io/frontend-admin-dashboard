import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MyButton } from "@/components/design-system/button";
import { EnrollManuallyButton } from "./enroll-manually/enroll-manually-button";
import { EnrollBulkButton } from "./enroll-bulk/enroll-bulk-button";
import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore";
import { useEffect, useState } from "react";
import { NoCourseDialog } from "./no-course-dialog";
import { DropdownItemType } from "./enroll-manually/dropdownTypesForPackageItems";

export const EnrollStudentsButton = () => {
    const { getCourseFromPackage } = useInstituteDetailsStore();
    const [courseList, setCourseList] = useState<DropdownItemType[]>(getCourseFromPackage());
    const [isOpen, setIsOpen] = useState(false);
    useEffect(() => {
        setCourseList(getCourseFromPackage());
    }, []);
    return (
        <>
            <Dialog>
                <DialogTrigger>
                    <MyButton
                        buttonType="primary"
                        scale="large"
                        layoutVariant="default"
                        id="enroll-students"
                        onClick={(e) => {
                            if (courseList.length === 0) {
                                setIsOpen(true);
                                e.stopPropagation();
                            }
                        }}
                    >
                        Enroll Students
                    </MyButton>
                </DialogTrigger>
                <DialogContent className="p-0 font-normal">
                    <DialogHeader>
                        <div className="bg-primary-50 px-6 py-4 text-h3 font-semibold text-primary-500">
                            Enroll Students
                        </div>
                        <DialogDescription className="flex flex-col items-center justify-center gap-6 p-6 text-neutral-600">
                            <EnrollManuallyButton />
                            <MyButton buttonType="secondary" scale="large" layoutVariant="default">
                                Enroll From Requests
                            </MyButton>
                            <EnrollBulkButton />
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <NoCourseDialog isOpen={isOpen} setIsOpen={setIsOpen} type={"enrolling students"} />
        </>
    );
};
