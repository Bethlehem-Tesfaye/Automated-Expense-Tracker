import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  useAdminSupportRequests,
  useCreateSupportRequest,
  useSupportRequests,
  useSupportResources,
} from "../../features/support/hooks/useSupport";
import type { SupportCategory } from "../../features/support/types/support";

function SupportPage() {
  const { data: resourcesResponse, isLoading: isResourcesLoading } =
    useSupportResources();
  const { data: requestsResponse, isLoading: isRequestsLoading } =
    useSupportRequests();
  const { isLoading: isAdminAccessLoading, isError: isAdminAccessError } =
    useAdminSupportRequests("open");
  const createSupportRequestMutation = useCreateSupportRequest();

  const resources = resourcesResponse?.data ?? [];
  const requests = requestsResponse?.data ?? [];

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<SupportCategory>("technical");
  const isSupportAdmin = !isAdminAccessLoading && !isAdminAccessError;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await createSupportRequestMutation.mutateAsync({
      subject: subject.trim(),
      message: message.trim(),
      category,
    });

    setSubject("");
    setMessage("");
    setCategory("technical");
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F2854]">Support</h1>
          <p className="mt-1 text-sm text-[#4988C4]">
            Find quick help articles or send a support request to our team and
            they will contact u through ur email.
          </p>
        </div>

        {isSupportAdmin && (
          <Link
            to="/support/admin"
            className="inline-flex w-fit items-center rounded-md border border-[#BDE8F5] bg-white px-3 py-2 text-xs font-semibold text-[#1C4D8D] transition-colors hover:bg-[#EEF6FF]"
          >
            Open Admin Queue
          </Link>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
          <h2 className="text-xl font-semibold text-[#0F2854]">Quick Help</h2>
          <div className="mt-4 space-y-3">
            {isResourcesLoading ? (
              <p className="text-sm text-[#4988C4]">
                Loading support resources...
              </p>
            ) : resources.length === 0 ? (
              <p className="text-sm text-[#4988C4]">
                No support resources available.
              </p>
            ) : (
              resources.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-[#DCE9FA] bg-[#F8FBFF] p-3"
                >
                  <p className="text-sm font-semibold text-[#0F2854]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-[#4988C4]">
                    {item.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-xl border border-[#BDE8F5] bg-white p-4">
          <h2 className="text-xl font-semibold text-[#0F2854]">
            Contact Support
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1C4D8D]">
                Category
              </span>
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as SupportCategory)
                }
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
              >
                <option value="technical">Technical issue</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="feature">Feature request</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1C4D8D]">
                Subject
              </span>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-[#0F2854]"
                placeholder="Brief summary"
                required
                minLength={3}
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[#1C4D8D]">
                Message
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="min-h-32 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-[#0F2854]"
                placeholder="Describe your issue in detail"
                required
                minLength={10}
              />
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createSupportRequestMutation.isPending}
                className="rounded-md bg-[#1C4D8D] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0F2854] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createSupportRequestMutation.isPending
                  ? "Submitting..."
                  : "Submit Request"}
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="rounded-xl border border-[#BDE8F5] bg-white p-4">
        <h2 className="text-xl font-semibold text-[#0F2854]">
          Recent Requests
        </h2>
        <div className="mt-4 space-y-2">
          {isRequestsLoading ? (
            <p className="text-sm text-[#4988C4]">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-[#4988C4]">No requests submitted yet.</p>
          ) : (
            requests.map((request) => (
              <article
                key={request.id}
                className="flex flex-col gap-2 rounded-lg border border-[#DCE9FA] bg-[#F8FBFF] p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0F2854]">
                    {request.subject}
                  </p>
                  <p className="mt-1 text-xs capitalize text-[#4988C4]">
                    {request.category} •{" "}
                    {new Date(request.createdAt).toLocaleDateString("en-US")}
                  </p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-[#EAF3FF] px-2 py-1 text-xs font-semibold uppercase text-[#1C4D8D]">
                  {request.status}
                </span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default SupportPage;
