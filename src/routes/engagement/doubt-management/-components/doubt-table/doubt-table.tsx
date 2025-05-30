import { MyTable } from '@/components/design-system/table';
import { MyPagination } from '@/components/design-system/pagination';
import { Doubt } from '@/routes/study-library/courses/levels/subjects/modules/chapters/slides/-types/get-doubts-type';
import { useDoubtTable, useDoubtTableColumns } from '../../-hooks/useDoubtTable';
import { DOUBTS_TABLE_COLUMN_WIDTHS } from '@/components/design-system/utils/constants/table-layout';

export const DoubtTable = () => {
    const { currentPage, setCurrentPage, doubts, isLoading, error } = useDoubtTable();
    const { columns } = useDoubtTableColumns();
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="no-scrollbar flex w-full flex-col gap-10 overflow-y-scroll">
            <div className="flex w-full flex-col gap-6 ">
                {doubts?.content.length == 0 ? (
                    <p className="text-primary-500">No student activity found</p>
                ) : (
                    <>
                        <MyTable<Doubt>
                            currentPage={currentPage}
                            data={doubts}
                            columns={columns}
                            isLoading={isLoading}
                            error={error}
                            scrollable
                            columnWidths={DOUBTS_TABLE_COLUMN_WIDTHS}
                        />
                        {doubts && doubts.total_pages > 1 && (
                            <MyPagination
                                currentPage={currentPage}
                                totalPages={doubts.total_pages}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
