import SelectChips from '@/components/design-system/SelectChips';
import { useEffect, useState } from 'react';
import { FilterType } from '../../-types/filter-type';
import { useDoubtFilters } from '../../-stores/filter-store';

export const StatusFilter = () => {
    const { updateFilters } = useDoubtFilters();

    const statusFilterList: FilterType[] = [
        {
            label: 'All',
            value: '',
        },
        {
            label: 'Resolved',
            value: 'RESOLVED',
        },
        {
            label: 'Unresolved',
            value: 'ACTIVE',
        },
    ];

    const [selectedStatus, setSelectedStatus] = useState([statusFilterList[0]!]);

    const handleStatusChange = (status: FilterType[]) => {
        setSelectedStatus(status);
    };

    useEffect(() => {
        if (selectedStatus.includes(statusFilterList[0]!)) {
            updateFilters({
                status: ['ACTIVE', 'RESOLVED'],
            });
        } else {
            updateFilters({
                status: selectedStatus.map((status) => status.value),
            });
        }
    }, [selectedStatus]);

    return (
        <SelectChips
            options={statusFilterList}
            selected={selectedStatus}
            onChange={handleStatusChange}
            hasClearFilter={false}
            className="min-w-40"
        />
    );
};
