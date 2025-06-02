import { DateFilter } from './date-filter';
import { BatchFilter } from './batch-filter';
import { StatusFilter } from './status-filter';

export const Filters = () => {
    return (
        <div className="flex items-center gap-3">
            <StatusFilter />
            <BatchFilter />
            <DateFilter />
        </div>
    );
};
