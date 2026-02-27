import { Skeleton } from "../../../components/ui/skeleton";

const HEADER_COLUMNS = 5;
const ROWS = 5;

function ExpenseListTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-sm font-semibold text-gray-500">
            {Array.from({ length: HEADER_COLUMNS }).map((_, index) => (
              <th key={index} className="px-5 py-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              <td className="px-5 py-6">
                <Skeleton className="h-5 w-40" />
              </td>
              <td className="px-5 py-6">
                <Skeleton className="h-5 w-28" />
              </td>
              <td className="px-5 py-6">
                <Skeleton className="h-7 w-28 rounded-full" />
              </td>
              <td className="px-5 py-6">
                <Skeleton className="h-6 w-20" />
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

export default ExpenseListTableSkeleton;
