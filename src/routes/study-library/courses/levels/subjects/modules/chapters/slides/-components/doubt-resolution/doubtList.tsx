import { Doubt as DoubtType } from '../../-types/get-doubts-type';
import { DashboardLoader } from '@/components/core/dashboard-loader';
import { Doubt } from './doubt';

export const DoubtList = ({
    allDoubts,
    isLoading,
    lastDoubtElementRef,
    refetch,
    isFetchingNextPage,
    status,
}: {
    allDoubts: DoubtType[];
    isLoading: boolean;
    lastDoubtElementRef: (node: HTMLDivElement) => void;
    refetch: () => void;
    isFetchingNextPage: boolean;
    status: string;
}) => {
    // Only show empty state if we're not loading and we truly have no doubts
    const shouldShowEmptyState = !isLoading && !isFetchingNextPage && allDoubts.length === 0;

    return (
        <div>
            {isLoading && <DashboardLoader />}
            {!isLoading && allDoubts && allDoubts?.length > 0
                ? allDoubts?.map((doubt, index) => (
                      <div
                          key={doubt.id || index}
                          ref={index === allDoubts.length - 1 ? lastDoubtElementRef : undefined}
                      >
                          <Doubt doubt={doubt} refetch={refetch} />
                      </div>
                  ))
                : shouldShowEmptyState && (
                      <div className="flex h-full min-h-[70vh] flex-col items-center justify-center ">
                          <p className="text-regular text-center text-neutral-400">
                              No doubts{' '}
                              {status === 'ALL'
                                  ? 'added'
                                  : status == 'RESOLVED'
                                    ? 'resolved'
                                    : 'unresolved'}
                          </p>
                      </div>
                  )}
            {isFetchingNextPage && <DashboardLoader />}
        </div>
    );
};
