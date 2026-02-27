import { Skeleton } from "../../../components/ui/skeleton";

const ROWS = 5;

function CategoriesTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-sm font-semibold text-gray-500">
            <th className="px-5 py-4">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-5 py-4">
              <Skeleton className="h-4 w-20" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-5 py-6">
                <Skeleton className="h-5 w-40" />
              </td>
              <td className="px-5 py-6">
                <div className="flex items-center gap-5">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-4 rounded-sm" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoriesTableSkeleton;
