import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { moderateCampaign } from "@/server/moderation.functions";
import { toast } from "sonner";
import { z } from "zod";
import { Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Start a campaign — Compassion Bridge" },
      { name: "description", content: "Share your loved one's story and start a verified medical fundraising campaign on Compassion Bridge." },
    ],
  }),
  component: SubmitPage,
});

const schema = z.object({
  patient_name: z.string().trim().min(2, "Name is required").max(100),
  patient_age: z.number().min(0).max(120).optional().nullable(),
  condition: z.string().trim().min(2, "Medical condition is required").max(200),
  location: z.string().trim().max(120).optional().nullable(),
  story: z.string().trim().min(40, "Please write at least 40 characters").max(4000),
  goal_amount: z.number().min(50, "Minimum is 50").max(1000000),
});

function SubmitPage() {
  const navigate = useNavigate();
  const moderate = useServerFn(moderateCampaign);
  const [authChecked, setAuthChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [form, setForm] = useState({
    patient_name: "",
    patient_age: "",
    condition: "",
    location: "",
    story: "",
    goal_amount: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
      if (!data.session) navigate({ to: "/login" });
    });
  }, [navigate]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB");
      return;
    }
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse({
      patient_name: form.patient_name,
      patient_age: form.patient_age ? Number(form.patient_age) : null,
      condition: form.condition,
      location: form.location || null,
      story: form.story,
      goal_amount: Number(form.goal_amount),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!photo) {
      toast.error("Please upload a photo of the patient");
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");

      // Upload photo
      const ext = photo.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("patient-photos").upload(path, photo, {
        contentType: photo.type,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("patient-photos").getPublicUrl(path);

      // Insert campaign
      const { data: created, error: insErr } = await supabase
        .from("campaigns")
        .insert({
          user_id: userId,
          patient_name: parsed.data.patient_name,
          patient_age: parsed.data.patient_age,
          condition: parsed.data.condition,
          story: parsed.data.story,
          location: parsed.data.location,
          goal_amount: parsed.data.goal_amount,
          photo_url: pub.publicUrl,
          status: "pending_review",
        })
        .select("id")
        .single();
      if (insErr || !created) throw insErr ?? new Error("Failed to create campaign");

      // Trigger AI moderation
      toast.message("Submitting for AI review…");
      await moderate({ data: { campaignId: created.id } });

      toast.success("Campaign submitted! Review status is in your dashboard.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) return <Layout><div className="py-20 text-center text-muted-foreground">Loading…</div></Layout>;
  if (!authed) return null;

  return (
    <Layout>
      <section className="mx-auto max-w-2xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Start a campaign</h1>
        <p className="mt-2 text-muted-foreground">
          Share your loved one's story. Every submission is reviewed before going live.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-6">
          <div>
            <Label>Patient photo *</Label>
            <label className="mt-2 flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-6 transition-colors hover:border-primary">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="max-h-56 rounded-lg object-contain" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">JPG or PNG, up to 5MB. Real photos only.</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="patient_name">Patient's name *</Label>
              <Input id="patient_name" value={form.patient_name} onChange={(e) => set("patient_name", e.target.value)} maxLength={100} required />
            </div>
            <div>
              <Label htmlFor="patient_age">Age</Label>
              <Input id="patient_age" type="number" min={0} max={120} value={form.patient_age} onChange={(e) => set("patient_age", e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="condition">Medical condition *</Label>
            <Input id="condition" value={form.condition} onChange={(e) => set("condition", e.target.value)} placeholder="e.g. Acute leukemia" maxLength={200} required />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, country" maxLength={120} />
          </div>

          <div>
            <Label htmlFor="goal_amount">Amount needed (USD) *</Label>
            <Input id="goal_amount" type="number" min={50} max={1000000} value={form.goal_amount} onChange={(e) => set("goal_amount", e.target.value)} required />
          </div>

          <div>
            <Label htmlFor="story">Tell their story *</Label>
            <Textarea id="story" rows={8} value={form.story} onChange={(e) => set("story", e.target.value)} maxLength={4000} placeholder="Describe the medical situation, what treatment is needed, and how the funds will help. The more honest detail, the better." required />
            <p className="mt-1 text-xs text-muted-foreground">{form.story.length}/4000 characters</p>
          </div>

          <div className="rounded-xl bg-secondary/60 p-4 text-sm text-secondary-foreground">
            By submitting, you confirm this is a real person and the information is accurate. False
            campaigns are removed and reported.
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>) : "Submit for review"}
          </Button>
        </form>
      </section>
    </Layout>
  );
}
