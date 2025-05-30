import { useInstituteDetailsStore } from "@/stores/students/students-list/useInstituteDetailsStore"

export const BatchCell = ({batch_id}: {batch_id: string}) => {

    const {instituteDetails} = useInstituteDetailsStore();
    const batch = instituteDetails?.batches_for_sessions?.find(batch => batch.id==batch_id);

    const batchName = batch ?
        batch.level.level_name + ' ' + batch.package_dto.package_name + ' ' + batch.session.session_name
    : ""

    return (
        <div>
            <p>{batchName}</p>
        </div>
    )
}