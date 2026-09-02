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

    const geminiKey = process.env["GEMINI_API_KEY"];
    let englishPrompt = data.name;
    
    if (geminiKey) {
      try {
        const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${geminiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gemini-3.6-flash",
            messages: [{
              role: "user",
              content: `Translate to a short English visual description of the object for an image generator (no extra text, just the object name): ${data.name}`
            }]
          }),
        });
        if (geminiRes.ok) {
          const json = await geminiRes.json() as any;
          if (json.choices?.[0]?.message?.content) {
            englishPrompt = json.choices[0].message.content.trim();
          }
        }
      } catch (e) {
        console.error("Gemini translation error", e);
      }
    }

    const prompt = `Professional e-commerce category illustration for "${englishPrompt}". A single representative product centered, clean modern studio product photography, soft lighting, light neutral background, minimalist, no text, no watermark, square composition.`;
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
    
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) throw new Error("Erreur lors de la génération de l'image");

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const b64 = buffer.toString("base64");

    return { dataUrl: `data:image/jpeg;base64,${b64}` };
  });
