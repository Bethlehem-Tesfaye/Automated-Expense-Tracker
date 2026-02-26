import { Skeleton } from "../../../components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <section>
        <Skeleton className="h-10 w-72" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-28" />
            <Skeleton className="mt-2 h-3 w-36" />
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-64" />
          <div className="mt-7 flex flex-col items-center gap-6 lg:flex-row lg:items-start">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-7 flex h-56 items-end gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-full w-full" />
            ))}
          </div>
        </article>
      </section>

      <article className="rounded-xl border border-gray-200 bg-white p-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="mt-2 h-4 w-72" />
        <Skeleton className="mt-5 h-72 w-full" />
      </article>
    </div>
  );
}

export default DashboardSkeleton;
