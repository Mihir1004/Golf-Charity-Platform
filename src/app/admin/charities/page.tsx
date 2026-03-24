import { ActionFeedback } from "@/components/action-feedback";
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { requireAdmin } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { getActionFeedback, type SearchParams } from "@/lib/page-params";
import {
  archiveCharityAction,
  upsertCharityAction,
} from "@/server/actions/admin-actions";
import { listAllCharities } from "@/server/services/charity-service";

type AdminCharitiesPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminCharitiesPage({
  searchParams,
}: AdminCharitiesPageProps) {
  const session = await requireAdmin();
  const [params, charities] = await Promise.all([searchParams, listAllCharities()]);
  const feedback = getActionFeedback(params);

  return (
    <AppShell role={session.role} currentPath={ROUTES.adminCharities} authenticated>
      <PageIntro
        title="Charity Management"
        subtitle="Add, edit, and archive charity profiles including featured status."
      >
        {feedback ? <ActionFeedback message={feedback.message} tone={feedback.tone} /> : null}
      </PageIntro>

      <Panel title="Create Charity" subtitle="Add new charity profiles and spotlight flags.">
        <form action={upsertCharityAction} className="grid gap-3 md:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Charity name"
            className="px-3 py-2"
          />
          <input
            name="slug"
            required
            placeholder="charity-slug"
            className="px-3 py-2"
          />
          <input
            name="imageUrl"
            placeholder="Image URL (optional)"
            className="px-3 py-2 md:col-span-2"
          />
          <textarea
            name="description"
            required
            placeholder="Description"
            className="min-h-28 px-3 py-2 md:col-span-2"
          />
          <textarea
            name="upcomingEvents"
            placeholder="Upcoming events"
            className="min-h-20 px-3 py-2 md:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-[#456882]">
            <input type="checkbox" name="isFeatured" /> Featured charity
          </label>
          <label className="flex items-center gap-2 text-sm text-[#456882]">
            <input type="checkbox" name="isActive" defaultChecked /> Active
          </label>
          <button
            type="submit"
            className="btn-primary rounded-xl px-4 py-2 text-sm md:col-span-2"
          >
            Save Charity
          </button>
        </form>
      </Panel>

      <Panel title="Manage Existing Charities">
        <div className="space-y-4">
          {charities.length > 0 ? (
            charities.map((charity) => (
              <article key={charity.id} className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] p-4">
                <form action={upsertCharityAction} className="grid gap-2 md:grid-cols-2">
                  <input type="hidden" name="id" value={charity.id} />
                  <input
                    name="name"
                    defaultValue={charity.name}
                    className="px-3 py-2"
                  />
                  <input
                    name="slug"
                    defaultValue={charity.slug}
                    className="px-3 py-2"
                  />
                  <input
                    name="imageUrl"
                    defaultValue={charity.imageUrl ?? ""}
                    className="px-3 py-2 md:col-span-2"
                  />
                  <textarea
                    name="description"
                    defaultValue={charity.description}
                    className="min-h-20 px-3 py-2 md:col-span-2"
                  />
                  <label className="flex items-center gap-2 text-sm text-[#456882]">
                    <input type="checkbox" name="isFeatured" defaultChecked={charity.isFeatured} />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#456882]">
                    <input type="checkbox" name="isActive" defaultChecked={charity.isActive} />
                    Active
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="submit"
                      className="btn-secondary rounded-xl px-4 py-2 text-sm"
                    >
                      Update
                    </button>
                  </div>
                </form>
                <form action={archiveCharityAction} className="mt-2">
                  <input type="hidden" name="id" value={charity.id} />
                  <button
                    type="submit"
                    className="rounded-xl border border-[#8b2f1e] bg-[#fff4f0] px-3 py-1.5 text-xs font-semibold text-[#8b2f1e] hover:bg-[#ffe8e1]"
                  >
                    Archive
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="rounded-2xl border border-[#dce8f6] bg-[#f8fbff] px-3 py-3 text-sm text-[#4d6f87]">
              No charities created yet.
            </p>
          )}
        </div>
      </Panel>
    </AppShell>
  );
}
