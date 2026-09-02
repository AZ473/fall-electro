import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  images: z.array(z.string().min(10)).min(1).max(4),
  price: z.number().nonnegative(),
  categories: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
  brands: z.array(z.object({ id: z.string(), name: z.string() })).default([]),
  notes: z.string().optional(),
  notesImage: z.string().optional(),
});

export const generateProductDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: adminRow } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!adminRow;
    if (!isAdmin) throw new Error("Forbidden");

    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("AI indisponible (Clé GEMINI manquante)");

    const catList = data.categories.map((c) => `${c.name} (id=${c.id})`).join(", ") || "aucune";
    const brandList = data.brands.map((b) => `${b.name} (id=${b.id})`).join(", ") || "aucune";

    const payload = {
      messages: [
        {
          role: "system",
          content:
            "Tu es assistant catalogue d'une boutique d'électroménager et électronique au Sénégal (ElectroMaison). À partir de photos d'un produit, tu rédiges une fiche produit commerciale en français. Prix en FCFA. Réponds uniquement via l'outil fourni.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse ces photos d'un même produit (elles peuvent montrer plusieurs angles ou couleurs). Prix de vente: ${data.price} FCFA.\nCatégories existantes: ${catList}.\nMarques existantes: ${brandList}.\n${data.notes || data.notesImage ? `Voici des précisions supplémentaires fournies par l'utilisateur (texte et/ou image jointe en dernier). Intègre ces informations dans la fiche.\nNotes textuelles: ${data.notes || "Aucune"}\n` : ""}Donne un nom commercial court, une description vendeuse (3-5 phrases, avantages concrets), un SKU, et choisis la catégorie/marque la plus adaptée parmi les listes (id exact, ou null si aucune ne convient).`,
            },
            ...data.images.map((url) => ({ type: "image_url", image_url: { url } })),
            ...(data.notesImage ? [{ type: "image_url", image_url: { url: data.notesImage } }] : []),
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "fiche_produit",
            description: "Renvoie la fiche produit générée",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                sku: { type: "string" },
                category_id: { type: ["string", "null"] },
                brand_id: { type: ["string", "null"] },
                suggested_brand_name: { type: ["string", "null"] },
              },
              required: ["name", "description", "sku"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "fiche_produit" } },
    };

    const callGemini = async (model: string) => fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, ...payload }),
    });

    let res = await callGemini("gemini-3.6-flash");
    
    if (!res.ok && res.status >= 500) {
      console.warn(`Modèle gemini-3.6-flash indisponible (${res.status}), tentative de repli sur gemini-3.5-flash...`);
      res = await callGemini("gemini-3.5-flash");
    }
    
    if (!res.ok && res.status >= 500) {
       console.warn(`Modèle gemini-3.5-flash indisponible (${res.status}), tentative de repli sur gemini-2.5-flash...`);
       res = await callGemini("gemini-2.5-flash");
    }

    if (res.status === 429) throw new Error("Trop de requêtes IA, réessayez dans un instant.");
    if (res.status === 402) throw new Error("Crédits IA épuisés.");
    if (!res.ok) throw new Error(`Erreur IA (${res.status})`);

    const json = (await res.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Réponse IA vide");

    const parsed = JSON.parse(args) as {
      name: string;
      description: string;
      sku: string;
      category_id?: string | null;
      brand_id?: string | null;
      suggested_brand_name?: string | null;
    };

    const validCat = data.categories.some((c) => c.id === parsed.category_id) ? parsed.category_id! : null;
    const validBrand = data.brands.some((b) => b.id === parsed.brand_id) ? parsed.brand_id! : null;

    return {
      name: parsed.name,
      description: parsed.description,
      sku: parsed.sku,
      category_id: validCat,
      brand_id: validBrand,
      suggested_brand_name: parsed.suggested_brand_name ?? null,
    };
  });
