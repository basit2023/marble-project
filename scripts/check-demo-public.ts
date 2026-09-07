import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { connectDB } = await import("../src/lib/db");
  const { getCategoryPage, getProductPage, getProjectPage, getBlogPost } = await import("../src/lib/public/pages-data");
  const db = await connectDB();
  try {
    const [onyx, honeyOnyx, project, blog] = await Promise.all([
      getCategoryPage("onyx"),
      getProductPage("onyx", "honey-onyx-demo"),
      getProjectPage("modern-villa-stone-interior-demo"),
      getBlogPost("how-to-choose-marble-for-a-home-demo"),
    ]);
    console.info(JSON.stringify({
      onyx: onyx ? { products: onyx.products.length, image: Boolean(onyx.category.coverImage) } : null,
      honeyOnyx: honeyOnyx ? { name: honeyOnyx.product.name, images: honeyOnyx.product.images.length, related: honeyOnyx.related.length } : null,
      project: project ? { title: project.title, gallery: project.gallery.length, materials: project.materialsUsed.length } : null,
      blog: blog ? { title: blog.post.title, related: blog.related.length } : null,
    }, null, 2));
  } finally {
    await db.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? `${error.name}: ${error.message}` : "Demo route check failed.");
  process.exitCode = 1;
});
