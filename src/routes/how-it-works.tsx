import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — Compassion Bridge" },
      { name: "description", content: "How families can start a medical fundraising campaign and how donors give safely on Compassion Bridge." },
      { property: "og:title", content: "How it works — Compassion Bridge" },
      { property: "og:description", content: "A simple, transparent process for families and donors." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const steps = [
    {
      n: "01",
      t: "A family shares their story",
      d: "The patient's family creates an account, uploads a photo of the patient, writes a description of the medical condition, and sets the amount they need to raise.",
    },
    {
      n: "02",
      t: "Our AI reviewer checks it",
      d: "Within seconds, AI checks the photo and story for authenticity — looking for fraud, duplicate or unrelated content, and stock or AI-generated images. Borderline cases are flagged for a human admin to review.",
    },
    {
      n: "03",
      t: "The campaign goes live",
      d: "Approved campaigns appear on the public Campaigns page. Donors can read the story, see how much has been raised, and choose to give.",
    },
    {
      n: "04",
      t: "Donations are processed securely",
      d: "Donors pay through a trusted payment provider that handles card data on its own secure servers. We never see, store, or process raw credit card numbers.",
    },
    {
      n: "05",
      t: "Funds reach the family",
      d: "Donations are paid out to the family's verified bank account on a regular schedule. Donors and families both receive updates as the campaign progresses.",
    },
  ];

  return (
    <Layout>
      <section className="border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8 md:py-20">
          <h1 className="font-display text-4xl font-semibold md:text-5xl">How Compassion Bridge works</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A careful five-step process designed to protect families and donors alike.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8">
        <ol className="space-y-10">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-6">
              <div className="font-display text-3xl font-semibold text-primary">{s.n}</div>
              <div>
                <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-14 rounded-2xl border border-border/60 bg-card p-8 text-center">
          <h3 className="font-display text-2xl font-semibold">Ready to start?</h3>
          <p className="mt-2 text-muted-foreground">
            It only takes a few minutes to share your story.
          </p>
          <Link to="/submit" className="mt-5 inline-block">
            <Button size="lg">Start a campaign</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
