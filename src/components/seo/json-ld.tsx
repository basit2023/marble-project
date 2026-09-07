import { serializeJsonLd } from "@/lib/seo";

type LdNode = Record<string, unknown>;

/**
 * Renders one or more schema.org JSON-LD blocks. Data comes from the builders in
 * `@/lib/seo/jsonld`. `<script type="application/ld+json">` is a data block, not
 * executable script, so it is exempt from the script-src CSP directive; the
 * payload is still escaped by `serializeJsonLd`.
 */
export function JsonLd({ data }: { data: LdNode | LdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data];
  return (
    <>
      {nodes.map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(node) }}
        />
      ))}
    </>
  );
}
