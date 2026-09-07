/**
 * Phase 7 keyword strategy. These clusters guide the database-owned copy fields
 * (H1, first 100 words, one H2, metaTitle, slug, one image alt). They are NOT a
 * substitute for editorial copy and must never be stuffed. They are used only as
 * a last-resort `keywords` fallback and to power the admin SEO health hints.
 */
export const TARGET_CITIES = ["Lahore", "Karachi", "Islamabad"] as const;

export const KEYWORD_CLUSTERS = {
  home: [
    "marble supplier pakistan",
    "natural stone manufacturer pakistan",
    "marble price in pakistan",
    "marble exporter pakistan",
  ],
  materials: [
    "marble price in pakistan",
    "white marble pakistan",
    "onyx pakistan",
    "travertine pakistan",
    "granite pakistan",
    "marble flooring pakistan",
  ],
  products: [
    "marble price in pakistan",
    "white marble pakistan",
    "granite pakistan",
    "onyx pakistan",
    "marble flooring pakistan",
  ],
  projects: ["marble flooring pakistan", "natural stone manufacturer pakistan"],
  export: [
    "marble export from pakistan",
    "marble exporter pakistan",
    "natural stone manufacturer pakistan",
  ],
  blog: ["marble price in pakistan", "marble supplier pakistan", "stone care"],
  about: ["marble supplier pakistan", "natural stone manufacturer pakistan"],
  contact: ["marble supplier pakistan", ...TARGET_CITIES.map((city) => `marble supplier ${city.toLowerCase()}`)],
} as const;

export type KeywordCluster = keyof typeof KEYWORD_CLUSTERS;

export function clusterKeywords(cluster: KeywordCluster): string[] {
  return [...KEYWORD_CLUSTERS[cluster]];
}
