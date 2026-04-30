import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, ShieldCheck, Heart } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/campaigns/$id")({
  component: CampaignDetailPage,
});

interface Campaign {
  id: string;
  patient_name: string;
  patient_age: number | null;
  condition: string;
  story: string;
  photo_url: string | null;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  location: string | null;
  created_at: string;
}

interface Donation {
  id: string;
  amount: number;
  donor_name: string | null;
  message: string | null;
  anonymous: boolean;
  created_at: string;
}

function fmt(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

function CampaignDetailPage() {
  const { id } = Route.useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: c } = await supabase
        .from("campaigns")
        .select("id, patient_name, patient_age, condition, story, photo_url, goal_amount, raised_amount, currency, location, created_at, status")
        .eq("id", id)
        .in("status", ["approved", "completed"])
        .maybeSingle();
      if (!c) {
        setLoading(false);
        throw notFound();
      }
      setCampaign(c as Campaign);

      const { data: d } = await supabase
        .from("donations")
        .select("id, amount, donor_name, message, anonymous, created_at")
        .eq("campaign_id", id)
        .order("created_at", { ascending: false })
        .limit(20);
      setDonations((d ?? []) as Donation[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="font-display text-2xl">Campaign not found</h2>
          <Link to="/campaigns" className="mt-4 inline-block text-primary hover:underline">
            ← Browse all campaigns
          </Link>
        </div>
      </Layout>
    );
  }

  const raised = Number(campaign.raised_amount) || 0;
  const goal = Number(campaign.goal_amount) || 1;
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <Link to="/campaigns" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All campaigns
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
              {campaign.photo_url ? (
                <img
                  src={campaign.photo_url}
                  alt={`Photo of ${campaign.patient_name}`}
                  className="aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="grid aspect-[16/10] place-items-center bg-secondary text-muted-foreground">
                  <Heart className="h-16 w-16 opacity-30" />
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="h-3 w-3" /> Verified campaign
              </span>
              {campaign.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                  <MapPin className="h-3 w-3" /> {campaign.location}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold md:text-4xl">{campaign.patient_name}</h1>
            <p className="mt-1 text-lg text-primary">{campaign.condition}</p>
            {campaign.patient_age && (
              <p className="text-sm text-muted-foreground">Age {campaign.patient_age}</p>
            )}
            <div className="prose prose-sage mt-6 max-w-none whitespace-pre-wrap text-foreground/90">
              {campaign.story}
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl font-semibold">Recent donations</h2>
              {donations.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  No donations yet — be the first to give.
                </p>
              ) : (
                <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
                  {donations.map((d) => (
                    <li key={d.id} className="flex items-start gap-3 p-4">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
                        <Heart className="h-4 w-4" fill="currentColor" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {d.anonymous ? "Anonymous" : d.donor_name || "A kind stranger"}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {fmt(Number(d.amount), campaign.currency)}
                          </p>
                        </div>
                        {d.message && (
                          <p className="mt-1 text-sm text-muted-foreground">"{d.message}"</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-soft)]">
              <p className="font-display text-3xl font-semibold">{fmt(raised, campaign.currency)}</p>
              <p className="text-sm text-muted-foreground">
                raised of {fmt(goal, campaign.currency)} goal
              </p>
              <Progress value={pct} className="mt-4 h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{pct}% funded</p>

              <Button
                size="lg"
                className="mt-6 w-full"
                onClick={() =>
                  toast.info("Secure donations coming soon", {
                    description: "We're connecting our payment provider. Check back shortly!",
                  })
                }
              >
                Donate now
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Payments are processed through a secure provider. We never see or store your card
                details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
