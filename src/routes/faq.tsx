import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Compassion Bridge" },
      { name: "description", content: "Answers to common questions about starting a campaign or donating on Compassion Bridge." },
      { property: "og:title", content: "FAQ — Compassion Bridge" },
      { property: "og:description", content: "Common questions about Compassion Bridge." },
    ],
  }),
  component: FaqPage,
});

const faqs = [
  {
    q: "How do donations actually reach my family?",
    a: "Donations are processed by a trusted payment provider. After verification, funds are paid out to your bank account on a regular schedule. We never ask for or store raw credit card numbers.",
  },
  {
    q: "Why does my campaign need to be reviewed?",
    a: "Reviewing every campaign protects both donors and the families on our platform. Without review, fraud and misleading listings would erode trust for everyone. Most reviews complete in minutes.",
  },
  {
    q: "What kind of photo should I upload?",
    a: "A clear, real photo of the patient. Avoid memes, screenshots, stock photos, or AI-generated images — these will be rejected automatically.",
  },
  {
    q: "Are there fees?",
    a: "Payment providers charge a small per-transaction fee that goes to them, not to us. We will always disclose any platform fee clearly before you submit a donation.",
  },
  {
    q: "Can I donate anonymously?",
    a: "Yes. When you give, you can choose to hide your name from the public donation feed.",
  },
  {
    q: "What if I see a campaign that looks suspicious?",
    a: "Please contact us right away. We take fraud seriously and will investigate every report.",
  },
];

function FaqPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-4xl font-semibold md:text-5xl">Frequently asked questions</h1>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-lg">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </Layout>
  );
}
