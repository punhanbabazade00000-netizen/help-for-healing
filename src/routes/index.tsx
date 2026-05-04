import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, HandHeart } from "lucide-react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { CampaignCard, type CampaignCardData } from "@/components/site/CampaignCard";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-hands.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compassion Bridge — Help families facing medical hardship" },
      {
        name: "description",
        content:
          "Verified medical fundraising for families who need help paying for a loved one's treatment. Donate securely or share your story.",
      },
      { property: "og:title", content: "Compassion Bridge" },
      {
        property: "og:description",
        content: "Verified medical fundraising for families in need.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [featured, setFeatured] = useState<CampaignCardData[]>([]);

  useEffect(() => {
    supabase
      .from("campaigns")
      .select("id, patient_name, condition, story, photo_url, goal_amount, raised_amount, currency, location")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setFeatured((data ?? []) as CampaignCardData[]));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Drifting decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-sage-soft/60 blur-3xl animate-blob" />
        <div aria-hidden className="pointer-events-none absolute -right-32 top-40 -z-10 h-80 w-80 rounded-full bg-sage/30 blur-3xl animate-blob" style={{ animationDelay: "-4s" }} />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground animate-fade-in-up animate-pulse-ring">
              <Sparkles className="h-3 w-3" /> AI-verified campaigns
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] md:text-6xl animate-fade-in-up delay-100">
              When a loved one is ill,{" "}
              <span className="shimmer-text">no family</span> should have to face it alone.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground animate-fade-in-up delay-200">
              Compassion Bridge helps families share their story and receive verified donations
              to pay for medical care — quickly, transparently, and safely.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-300">
              <Link to="/campaigns">
                <Button size="lg" className="gap-2 group">
                  Donate to a family
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/submit">
                <Button size="lg" variant="outline">
                  Start a campaign
                </Button>
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground animate-fade-in-up delay-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Each campaign reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <HandHeart className="h-4 w-4 text-primary" />
                <span>100% secure donations</span>
              </div>
            </div>
          </div>
          <div className="relative animate-scale-in delay-200">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-secondary/60 blur-2xl animate-float-soft" />
            <img
              src={heroImg}
              alt="Hands gently holding a sage leaf — a symbol of care"
              width={1600}
              height={1200}
              className="rounded-[2rem] shadow-[var(--shadow-card)] animate-float-soft"
              style={{ animationDelay: "-2s" }}
            />
          </div>
        </div>
      </section>

      {/* Featured campaigns */}
      <section className="border-t border-border/40 bg-background/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Families that need help right now
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Each of these campaigns has been reviewed for authenticity. Even a small gift makes
                a difference.
              </p>
            </div>
            <Link to="/campaigns" className="hidden text-sm font-medium text-primary hover:underline md:inline">
              See all campaigns →
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
              <p>No verified campaigns yet. Be the first to share a story —</p>
              <Link to="/submit" className="mt-3 inline-block font-medium text-primary hover:underline">
                Start a campaign →
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {featured.map((c, i) => (
                <div
                  key={c.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  <CampaignCard c={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">A simple, careful process</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Share the story",
                d: "Families upload a photo of their loved one and explain the medical situation and how much is needed.",
              },
              {
                n: "02",
                t: "AI review",
                d: "Every submission is automatically reviewed for authenticity before going live, so donors can give with confidence.",
              },
              {
                n: "03",
                t: "Donors give securely",
                d: "Donations are processed through a trusted payment provider — we never store credit card numbers.",
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border/60 bg-card p-7 hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="font-display text-3xl text-primary">{s.n}</div>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/how-it-works" className="text-sm font-medium text-primary hover:underline">
              Learn more about how Compassion Bridge works →
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
