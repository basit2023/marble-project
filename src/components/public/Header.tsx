import { getPublicLayoutData } from "@/lib/public/data";
import { HeaderClient } from "./HeaderClient";

/**
 * Server Component: reads nav + settings + menu categories from MongoDB (via the
 * resilient getPublicLayoutData, which falls back to DEFAULT_* and never throws)
 * and hands plain serialisable data to the client shell.
 */
export async function Header() {
  const { settings, navigation, categories } = await getPublicLayoutData();

  const nav = navigation
    .filter((item) => item.location === "header" && !item.parentItem)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({ label: item.label, url: item.url, openInNewTab: item.openInNewTab }));

  return (
    <HeaderClient
      siteName={settings.siteName}
      logo={settings.logoLight ?? settings.logo}
      phone={settings.phone[0]}
      quoteUrl="/quote"
      nav={nav}
      materials={categories.map((category) => ({ name: category.name, slug: category.slug }))}
    />
  );
}
