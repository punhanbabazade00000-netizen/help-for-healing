import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                <Heart className="h-3.5 w-3.5" fill="currentColor" />
              </span>
              Compassion Bridge
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              A safe place for families facing medical hardship to ask for help — and for the
              kindness of strangers to reach them quickly.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Discover</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/campaigns" className="hover:text-foreground">Campaigns</Link></li>
              <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Help</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
              <li><Link to="/submit" className="hover:text-foreground">Start a campaign</Link></li>
              <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Compassion Bridge. Built with care.</p>
          <p>Donations are processed securely. We never store credit card numbers.</p>
        </div>
      </div>
    </footer>
  );
}
