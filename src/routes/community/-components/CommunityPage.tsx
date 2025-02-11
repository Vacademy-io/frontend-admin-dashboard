import { PublishTab } from "./PublishTab";
import { CommunityPageHeader } from "./CommunityPageHeader";
import { FiltersTab } from "./FiltersTab";
import { FilteredDataList } from "./FilteredDataList";

export function CommunityPage() {
    return (
        <div className="mb-10 flex w-full flex-col">
            <PublishTab />
            <CommunityPageHeader />
            <FiltersTab />
            <FilteredDataList />
        </div>
    );
}
