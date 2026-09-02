import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({ name: z.string().min(1) });

export const generateCategoryImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: adminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!adminRow) throw new Error("Forbidden");

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI indisponible");

    const prompt =
      `Professional e-commerce category illustration for "${data.name}". ` +
      `A single representative product centered, clean modern studio product photography, ` +
      `soft lighting, light neutral background, minimalist, no text, no watermark, square composition.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-image-2",
        prompt,
        quality: "low",
        size: "1024x1024",
        n: 1,
      }),
    });

    if (res.status === 429) throw new Error("Trop de requêtes IA, réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés.");
    if (!res.ok) throw new Error(`Erreur IA (${res.status})`);

    const json = (await res.json()) as { data?: { b64_json?: string }[] };
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("Image non générée");

    return { dataUrl: `data:image/png;base64,${b64}` };
  });
