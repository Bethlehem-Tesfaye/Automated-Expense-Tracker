import { useState } from "react";
import {
  useAdminSupportRequests,
  useUpdateSupportRequestStatus,
} from "../../features/support/hooks/useSupport";
import type { SupportStatus } from "../../features/support/types/support";

function SupportAdminPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | SupportStatus>(
    "open",
  );

  const {
    data: requestsResponse,
    isLoading,
    isError,
  } = useAdminSupportRequests(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const updateStatusMutation = useUpdateSupportRequestStatus();

  const requests = requestsResponse?.data ?? [];

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2854]">Support Admin</h1>
          <p className="mt-1 text-sm text-[#4988C4]">
            Review all support requests and mark them as open or resolved.
          </p>
        </div>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold text-[#1C4D8D]">
            Status filter
          </span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "all" | SupportStatus)
            }
            className="h-10 rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
      </section>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load admin support queue. Ensure your account email is
          listed in SUPPORT_ADMIN_EMAILS.
        </div>
      )}

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-[#4988C4]">Loading support queue...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-[#4988C4]">No support requests found.</p>
          ) : (
            requests.map((request) => (
              <article
                key={request.id}
                className="rounded-lg border border-[#DCE9FA] bg-[#F8FBFF] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0F2854]">
                      {request.subject}
                    </p>
                    <p className="mt-1 text-xs text-[#4988C4]">
                      {request.userName} • {request.userEmail}
                    </p>
                    <p className="mt-2 text-xs capitalize text-[#1C4D8D]">
                      {request.category} •{" "}
                      {new Date(request.createdAt).toLocaleString("en-US")}
                    </p>
                    <p className="mt-3 text-sm text-[#0F2854]">
                      {request.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: request.id,
                          status: "open",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="rounded-md border border-[#BDE8F5] px-3 py-1.5 text-xs font-semibold text-[#0F2854] hover:bg-[#EEF6FF] disabled:opacity-60"
                    >
                      Mark Open
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: request.id,
                          status: "resolved",
                        })
                      }
                      disabled={updateStatusMutation.isPending}
                      className="rounded-md bg-[#1C4D8D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0F2854] disabled:opacity-60"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default SupportAdminPage;
