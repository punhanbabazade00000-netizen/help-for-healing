import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your Dashboard — Compassion Bridge" },
      { name: "description", content: "Manage your medical fundraising campaigns." },
    ],
  }),
  component: DashboardPage,
});

interface MyCampaign {
  id: string;
  patient_name: string;
  condition: string;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  status: string;
  moderation_reason: string | null;
  created_at: string;
}

const statusLabels: Record<string, { label: string; tone: string }> = {
  pending_review: { label: "Pending review", tone: "bg-amber-100 text-amber-900" },
  approved: { label: "Live", tone: "bg-primary/15 text-primary" },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive" },
  needs_human_review: { label: "Awaiting human review", tone: "bg-amber-100 text-amber-900" },
  completed: { label: "Completed", tone: "bg-secondary text-secondary-foreground" },
};

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<MyCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(data.session.user.email ?? null);

      const { data: cs } = await supabase
        .from("campaigns")
        .select("id, patient_name, condition, goal_amount, raised_amount, currency, status, moderation_reason, created_at")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });
      setCampaigns((cs ?? []) as MyCampaign[]);
      setLoading(false);
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Your dashboard</h1>
            {email && <p className="mt-1 text-sm text-muted-foreground">Signed in as {email}</p>}
          </div>
          <div className="flex gap-2">
            <Link to="/submit"><Button className="gap-2"><Plus className="h-4 w-4" /> New campaign</Button></Link>
            <Button variant="ghost" onClick={signOut} className="gap-2"><LogOut className="h-4 w-4" /> Sign out</Button>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold">Your campaigns</h2>
          {loading ? (
            <p className="mt-4 text-muted-foreground">Loading…</p>
          ) : campaigns.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
              <p className="text-muted-foreground">You haven't started a campaign yet.</p>
              <Link to="/submit" className="mt-4 inline-block">
                <Button>Start your first campaign</Button>
              </Link>
            </div>
          ) : (
            <ul className="mt-6 space-y-4">
              {campaigns.map((c) => {
                const tone = statusLabels[c.status] ?? { label: c.status, tone: "bg-muted" };
                const raised = Number(c.raised_amount) || 0;
                return (
                  <li key={c.id} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-semibold">{c.patient_name}</h3>
                        <p className="text-sm text-primary">{c.condition}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone.tone}`}>
                        {tone.label}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm text-muted-foreground">
                      <span>
                        {fmt(raised, c.currency)} raised of {fmt(Number(c.goal_amount), c.currency)}
                      </span>
                      {c.status === "approved" && (
                        <Link to="/campaigns/$id" params={{ id: c.id }} className="font-medium text-primary hover:underline">
                          View public page →
                        </Link>
                      )}
                    </div>
                    {c.moderation_reason && (
                      <p className="mt-3 rounded-md bg-secondary/60 p-3 text-sm text-secondary-foreground">
                        <span className="font-medium">Review note:</span> {c.moderation_reason}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </Layout>
  );
}
