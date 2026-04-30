import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { CampaignCard, type CampaignCardData } from "@/components/site/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Browse Campaigns — Compassion Bridge" },
      { name: "description", content: "Browse verified medical fundraising campaigns from families in need." },
      { property: "og:title", content: "Browse Campaigns — Compassion Bridge" },
      { property: "og:description", content: "Verified medical fundraising campaigns." },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("id, patient_name, condition, story, photo_url, goal_amount, raised_amount, currency, location")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampaigns((data ?? []) as CampaignCardData[]);
        setLoading(false);
      });
  }, []);

  const filtered = q
    ? campaigns.filter((c) =>
        [c.patient_name, c.condition, c.location ?? "", c.story]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : campaigns;

  return (
    <Layout>
      <section className="border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">All campaigns</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Each family's story is reviewed before going live. Choose a campaign to learn more and
            give what you can.
          </p>
          <div className="relative mt-8 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, condition, or location"
              className="pl-9"
              maxLength={100}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        {loading ? (
          <div className="text-center text-muted-foreground">Loading campaigns…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <p className="text-muted-foreground">No campaigns match your search.</p>
            <Link to="/submit" className="mt-4 inline-block font-medium text-primary hover:underline">
              Start a campaign →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
