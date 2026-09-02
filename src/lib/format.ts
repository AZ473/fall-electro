export const formatCFA = (n: number | null | undefined) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(Number(n ?? 0))) + " CFA";

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
