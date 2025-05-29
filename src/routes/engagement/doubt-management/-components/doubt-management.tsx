import { useEffect } from 'react';
import { useDoubtFilters } from '../-stores/filter-store';
import { Filters } from './filters/filters';

export const DoubtManagement = () => {
    const { filters } = useDoubtFilters();

    useEffect(() => {
        console.log('filters: ', filters);
    }, [filters]);

    return (
        <div>
            <Filters />
        </div>
    );
};
