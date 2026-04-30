import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const moderateInput = z.object({
  campaignId: z.string().uuid(),
});

interface AIDecision {
  decision: "approve" | "reject" | "flag_for_review";
  confidence: number;
  reason: string;
}

async function callLovableAI(prompt: string, photoUrl: string | null): Promise<AIDecision> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    return {
      decision: "flag_for_review",
      confidence: 0.0,
      reason: "AI moderation unavailable — flagged for human review.",
    };
  }

  const userContent: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
  if (photoUrl) {
    userContent.push({ type: "image_url", image_url: { url: photoUrl } });
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You are a content moderator for a charity platform that helps families pay for medical care for ill family members. Review the submission for: (1) signs of fraud, scam, or duplicated content; (2) hateful, sexual, violent, or otherwise inappropriate content; (3) requests unrelated to medical care; (4) clearly fake or AI-generated patient photos, stock photos, memes, or unrelated images. Respond with strict JSON only — no prose.",
        },
        { role: "user", content: userContent as unknown as string },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_decision",
            description: "Return a moderation decision",
            parameters: {
              type: "object",
              properties: {
                decision: {
                  type: "string",
                  enum: ["approve", "reject", "flag_for_review"],
                  description:
                    "approve = clearly legitimate; reject = clearly inappropriate or fraud; flag_for_review = uncertain",
                },
                confidence: { type: "number", minimum: 0, maximum: 1 },
                reason: {
                  type: "string",
                  description: "1-2 sentence explanation suitable to show the family.",
                },
              },
              required: ["decision", "confidence", "reason"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_decision" } },
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    console.error("AI moderation error:", res.status, txt);
    return {
      decision: "flag_for_review",
      confidence: 0,
      reason: "Could not reach the moderation service. A human will review your submission.",
    };
  }

  const data = (await res.json()) as {
    choices?: Array<{
      message?: {
        tool_calls?: Array<{ function?: { arguments?: string } }>;
      };
    }>;
  };
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) {
    return {
      decision: "flag_for_review",
      confidence: 0,
      reason: "Moderation result was incomplete. A human will review your submission.",
    };
  }
  try {
    const parsed = JSON.parse(args) as AIDecision;
    return parsed;
  } catch {
    return {
      decision: "flag_for_review",
      confidence: 0,
      reason: "Could not parse moderation response. A human will review your submission.",
    };
  }
}

export const moderateCampaign = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => moderateInput.parse(input))
  .handler(async ({ data }) => {
    const { data: campaign, error } = await supabaseAdmin
      .from("campaigns")
      .select("id, patient_name, patient_age, condition, story, photo_url, goal_amount")
      .eq("id", data.campaignId)
      .single();

    if (error || !campaign) {
      return { ok: false as const, error: "Campaign not found." };
    }

    const prompt = `Please review this medical fundraising campaign:

Patient name: ${campaign.patient_name}
Age: ${campaign.patient_age ?? "not stated"}
Medical condition: ${campaign.condition}
Amount needed: ${campaign.goal_amount}

Story:
${campaign.story}

Check the photo (if attached) is a real personal photo of a person, not a stock image, meme, screenshot, or AI-generated image. Reject anything off-topic, hateful, sexual, or fraudulent. Approve clearly legitimate medical hardship requests with consistent, specific details. When in doubt, flag for human review.`;

    const ai = await callLovableAI(prompt, campaign.photo_url);

    const newStatus =
      ai.decision === "approve"
        ? "approved"
        : ai.decision === "reject"
          ? "rejected"
          : "needs_human_review";

    await supabaseAdmin.from("moderation_results").insert([
      {
        campaign_id: campaign.id,
        decision: ai.decision,
        confidence: ai.confidence,
        reason: ai.reason,
        raw_response: ai as unknown as never,
      },
    ]);

    await supabaseAdmin
      .from("campaigns")
      .update({ status: newStatus, moderation_reason: ai.reason })
      .eq("id", campaign.id);

    return { ok: true as const, status: newStatus, reason: ai.reason };
  });
