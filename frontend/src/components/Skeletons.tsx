/**
 * Loading Skeleton Components
 * Provides better UX during data fetching
 */

export const TableSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/5" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/5" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </div>
    </div>
  </div>
);

export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    </div>
    <div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full" />
    </div>
    <div className="flex gap-3">
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="animate-pulse space-y-2">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
