import { DeleteDoubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-components/doubt-resolution/DeleteDoubt"
import { Doubt } from "@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type";
import { isUserAdmin } from "@/utils/userDetails";
import { Eye } from "phosphor-react";

export const ActionsCell = ({doubt, refetch}:{doubt: Doubt, refetch: () => void}) => {
    const isAdmin = isUserAdmin();
    return(
        <div className="flex items-center gap-2 w-full justify-center text-center">
            <Eye />
            {isAdmin && <DeleteDoubt doubt={doubt} refetch={refetch} showText={false} />}
        </div>
    )
}