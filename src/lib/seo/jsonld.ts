import type { SeoSite, BreadcrumbItem } from "@/types/seo";
import type { MediaDTO } from "@/lib/media/contracts";
import type { ProductDetailDTO, BlogPostDTO } from "@/types/public-pages";

type Node = Record<string, unknown>;
const CONTEXT = "https://schema.org";

const abs = (site: SeoSite, path: string) => new URL(path, site.siteUrl).toString();
const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const clean = (node: Node): Node =>
  Object.fromEntries(Object.entries(node).filter(([, value]) => value !== undefined && value !== null && !(Array.isArray(value) && value.length === 0)));

function imageNode(site: SeoSite, media: MediaDTO): Node {
  return clean({
    "@type": "ImageObject",
    url: media.secureUrl,
    contentUrl: media.secureUrl,
    width: media.width,
    height: media.height,
    caption: media.altText || undefined,
    representativeOfPage: undefined,
    creditText: site.siteName,
  });
}

function organizationCore(site: SeoSite): Node {
  return clean({
    "@type": "Organization",
    "@id": `${site.siteUrl}#organization`,
    name: site.siteName,
    url: site.siteUrl,
    logo: site.logo ? site.logo.secureUrl : undefined,
    image: site.logo ? site.logo.secureUrl : undefined,
    description: site.defaultSeo.metaDescription ?? site.tagline,
    email: site.email[0],
    telephone: site.phone[0],
    sameAs: site.socialLinks.map((link) => link.url),
    contactPoint: site.phone.length || site.email.length
      ? clean({
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: site.phone[0],
          email: site.email[0],
          areaServed: areaServed(site),
          availableLanguage: ["en", "ur"],
        })
      : undefined,
    address: site.addresses.map((address) => clean({
      "@type": "PostalAddress",
      name: address.label,
      streetAddress: address.line1,
      addressLocality: address.city,
      addressCountry: address.country,
    })),
  });
}

function areaServed(site: SeoSite): string[] {
  const countries = site.addresses.map((address) => address.country).filter(Boolean);
  return [...new Set(countries.length ? countries : ["Pakistan"])];
}

export function organizationLd(site: SeoSite): Node {
  return { "@context": CONTEXT, ...organizationCore(site) };
}

export function localBusinessLd(site: SeoSite): Node {
  const primary = site.addresses[0];
  const geo = primary && primary.latitude !== undefined && primary.longitude !== undefined
    ? { "@type": "GeoCoordinates", latitude: primary.latitude, longitude: primary.longitude }
    : undefined;
  return {
    "@context": CONTEXT,
    ...organizationCore(site),
    "@type": ["Organization", "LocalBusiness", "HomeGoodsStore"],
    "@id": `${site.siteUrl}#localbusiness`,
    priceRange: site.priceRange ?? "$$",
    openingHours: site.businessHours || undefined,
    geo,
    hasMap: primary?.mapUrl,
    areaServed: areaServed(site),
  };
}

export function websiteLd(site: SeoSite): Node {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": `${site.siteUrl}#website`,
    url: site.siteUrl,
    name: site.siteName,
    publisher: { "@id": `${site.siteUrl}#organization` },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${abs(site, "/search")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(items: BreadcrumbItem[], site: SeoSite): Node {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => clean({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? abs(site, item.href) : undefined,
    })),
  };
}

const AVAILABILITY: Record<string, string> = {
  "In Stock": "https://schema.org/InStock",
  "Made to Order": "https://schema.org/MadeToOrder",
  Limited: "https://schema.org/LimitedAvailability",
};

export function productLd({ product, site, path }: { product: ProductDetailDTO; site: SeoSite; path: string }): Node {
  const images = [product.primaryImage, ...product.images]
    .filter((media): media is MediaDTO => Boolean(media))
    .map((media) => media.secureUrl);
  const availability = AVAILABILITY[product.stockStatus] ?? "https://schema.org/InStock";
  const price = product.isPriceVisible ? product.priceRange : undefined;
  const offers = price && price.min !== undefined && price.max !== undefined && price.currency
    ? clean({
        "@type": "AggregateOffer",
        priceCurrency: price.currency,
        lowPrice: price.min,
        highPrice: price.max,
        availability,
        url: abs(site, path),
        seller: { "@id": `${site.siteUrl}#organization` },
        ...(price.unit ? { unitText: price.unit } : {}),
      })
    : clean({
        "@type": "Offer",
        availability,
        url: abs(site, path),
        priceCurrency: price?.currency,
        seller: { "@id": `${site.siteUrl}#organization` },
      });
  return {
    "@context": CONTEXT,
    "@type": "Product",
    name: product.name,
    ...clean({
      image: [...new Set(images)],
      description: stripHtml(product.description).slice(0, 5000) || undefined,
      sku: product.slug,
      category: product.categoryName,
      material: product.colourFamily,
      url: abs(site, path),
    }),
    brand: { "@type": "Brand", name: site.siteName },
    manufacturer: { "@id": `${site.siteUrl}#organization` },
    additionalProperty: product.finishes.map((finish) => ({
      "@type": "PropertyValue", name: "Finish", value: finish,
    })),
    offers,
  };
}

export function articleLd({ post, site, path }: { post: BlogPostDTO; site: SeoSite; path: string }): Node {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: post.title.slice(0, 110),
    ...clean({
      description: post.excerpt,
      image: post.coverImage ? [post.coverImage.secureUrl] : undefined,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      articleSection: post.category,
      keywords: post.tags.length ? post.tags.join(", ") : undefined,
      wordCount: stripHtml(post.content).split(/\s+/).filter(Boolean).length || undefined,
      timeRequired: `PT${Math.max(1, post.readTimeMinutes)}M`,
    }),
    inLanguage: "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(site, path) },
    author: { "@type": "Person", name: post.author?.name ?? site.siteName },
    publisher: {
      "@type": "Organization",
      name: site.siteName,
      logo: site.logo ? { "@type": "ImageObject", url: site.logo.secureUrl } : undefined,
    },
  };
}

export function faqPageLd(faqs: Array<{ question: string; answer: string }>): Node {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(faq.answer) },
    })),
  };
}

export function itemListLd({ items, site }: { items: Array<{ name: string; path: string }>; site: SeoSite }): Node {
  return {
    "@context": CONTEXT,
    "@type": "ItemList",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: abs(site, item.path),
    })),
  };
}

export function imageGalleryLd({ images, site, name }: { images: MediaDTO[]; site: SeoSite; name: string }): Node {
  return {
    "@context": CONTEXT,
    "@type": "ImageGallery",
    name,
    image: images.map((media) => imageNode(site, media)),
  };
}

export function eventLd({ event, site, path }: {
  event: { name: string; description: string; startDate: string; endDate: string; venue: string; city: string; country: string; coverImage?: MediaDTO };
  site: SeoSite;
  path: string;
}): Node {
  return {
    "@context": CONTEXT,
    "@type": "ExhibitionEvent",
    name: event.name,
    ...clean({
      description: stripHtml(event.description).slice(0, 2000) || undefined,
      image: event.coverImage ? [event.coverImage.secureUrl] : undefined,
    }),
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressCountry: event.country,
      },
    },
    organizer: { "@id": `${site.siteUrl}#organization` },
    url: abs(site, path),
  };
}
