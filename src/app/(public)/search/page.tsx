import { searchPublicContent } from "@/lib/public/pages-data";
import { metadataFromSeo } from "@/lib/public/metadata";
import { PageHero } from "@/components/public/page-hero";
import { SearchResults } from "@/components/public/search-results";

export const revalidate = 60;

export function generateMetadata() {
  return metadataFromSeo(undefined, "Search", "Search marble, granite and onyx products, completed projects and stone-care articles.", "/search", { noIndex: true });
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string | string[] }> }) {
  const params = await searchParams;
  const query = params.q ?? "";
  const types = Array.isArray(params.type) ? params.type : params.type ? [params.type] : [];
  const results = await searchPublicContent(query, types);
  return <><PageHero title="Search" body="Find stones, completed projects and stone-care articles." /><SearchResults results={results} query={query} /></>;
}
