import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface CampaignCardData {
  id: string;
  patient_name: string;
  condition: string;
  story: string;
  photo_url: string | null;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  location: string | null;
}

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n.toFixed(0)}`;
  }
}

export function CampaignCard({ c }: { c: CampaignCardData }) {
  const raised = Number(c.raised_amount) || 0;
  const goal = Number(c.goal_amount) || 1;
  const pct = Math.min(100, Math.round((raised / goal) * 100));

  return (
    <Link
      to="/campaigns/$id"
      params={{ id: c.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        {c.photo_url ? (
          <img
            src={c.photo_url}
            alt={`Photo of ${c.patient_name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Heart className="h-10 w-10 opacity-30" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold leading-tight">{c.patient_name}</h3>
        <p className="mt-1 text-sm text-primary">{c.condition}</p>
        {c.location && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {c.location}
          </p>
        )}
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{c.story}</p>
        <div className="mt-auto pt-5">
          <Progress value={pct} className="h-1.5" />
          <div className="mt-2 flex items-baseline justify-between text-sm">
            <span className="font-semibold text-foreground">{formatMoney(raised, c.currency)}</span>
            <span className="text-xs text-muted-foreground">
              raised of {formatMoney(goal, c.currency)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
