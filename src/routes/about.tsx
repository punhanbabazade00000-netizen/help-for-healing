import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Compassion Bridge" },
      { name: "description", content: "Why we built Compassion Bridge — a safer way for families to ask for help with medical bills." },
      { property: "og:title", content: "About — Compassion Bridge" },
      { property: "og:description", content: "Our mission and values." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Why Compassion Bridge exists</h1>
        <div className="prose mt-8 max-w-none space-y-5 text-lg text-foreground/85">
          <p>
            Around the world, families face an impossible choice: pay for medical care for a sick
            child, parent or partner — or pay rent. For many, the bills simply cannot be met.
          </p>
          <p>
            Compassion Bridge is a small, careful platform built so that anyone can share their
            family's story and reach donors who want to help. We focus on three things:
            <strong> trust, transparency, and safety.</strong>
          </p>
          <h2 className="font-display text-2xl font-semibold">Trust</h2>
          <p>
            Every campaign is reviewed before it goes live. We use AI moderation to catch fraud,
            duplicate listings, and inappropriate content, and a human reviews anything uncertain.
          </p>
          <h2 className="font-display text-2xl font-semibold">Transparency</h2>
          <p>
            Donors see exactly how much has been raised and the donations that have come in. Families
            can post updates so the people who helped know how things are going.
          </p>
          <h2 className="font-display text-2xl font-semibold">Safety</h2>
          <p>
            We never ask anyone to type their credit card number into a form on our site — that
            would be both illegal and dangerous. Donations are processed by a regulated payment
            provider. Funds are sent to families through verified bank transfers, never raw card
            details.
          </p>
        </div>
      </section>
    </Layout>
  );
}
