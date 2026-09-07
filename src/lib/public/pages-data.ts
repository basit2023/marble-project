import "server-only";
import { cache } from "react";
import { Types, type FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db";
import { publicFilter } from "@/models/content-fields";
import { BlogPost, Category, Exhibition, Faq, Inquiry, Media, Page, Product, Project, SiteSettings } from "@/models";
import { toMediaDTO } from "@/lib/media/service";
import type { IMedia } from "@/types/media";
import type { IProduct } from "@/types/product";
import type { IProject } from "@/types/project";
import type { IBlogPost } from "@/types/blog-post";
import type { IPage } from "@/types/page";
import type { CategoryCardDTO, ProductCardDTO, ProductDetailDTO, ProjectCardDTO, ProjectDetailDTO, ExhibitionDTO, BlogPostDTO, PageDTO, SearchResultDTO, SeoDTO } from "@/types/public-pages";

type PopulatedMedia = IMedia | null | undefined;
type MediaField = Types.ObjectId | PopulatedMedia;
type PopulatedCategory = { _id: Types.ObjectId; name: string; slug: string };
type ProductWithCategory = Omit<IProduct, "category"> & { category: PopulatedCategory };
type BlogAuthor = { name: string; role?: string } | null | undefined;

const now = () => new Date();
const id = (value: { toString(): string }) => value.toString();
const activeMedia = (value: MediaField | null | undefined) => {
  const candidate = value as PopulatedMedia;
  return candidate && candidate.isActive && !candidate.isDeleted ? toMediaDTO(candidate) : undefined;
};
const activeMediaList = (items: Array<MediaField> | undefined) => (items ?? []).map(activeMedia).filter((item): item is NonNullable<typeof item> => Boolean(item));

function seoDTO(seo: { metaTitle?: string; metaDescription?: string; keywords: string[]; canonicalUrl?: string; noIndex: boolean; ogImage?: MediaField | null }): SeoDTO {
  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords,
    canonicalUrl: seo.canonicalUrl,
    noIndex: seo.noIndex,
    ogImage: activeMedia(seo.ogImage),
  };
}

function productCard(item: ProductWithCategory): ProductCardDTO {
  const priceRange = item.isPriceVisible && item.priceRange ? {
    min: item.priceRange.min,
    max: item.priceRange.max,
    currency: item.priceRange.currency,
    unit: item.priceRange.unit,
  } : undefined;
  return {
    id: id(item._id),
    name: item.name,
    slug: item.slug,
    categorySlug: item.category.slug,
    categoryName: item.category.name,
    description: item.description,
    origin: item.origin,
    colourFamily: item.colourFamily,
    finishes: item.finishes,
    availableFormats: item.availableFormats,
    applications: item.applications,
    primaryImage: activeMedia(item.primaryImage),
    isPriceVisible: item.isPriceVisible,
    priceRange,
  };
}

function productDetail(item: ProductWithCategory): ProductDetailDTO {
  return {
    ...productCard(item),
    images: activeMediaList(item.images),
    technicalSpecs: item.technicalSpecs ? {
      density: item.technicalSpecs.density ?? null,
      waterAbsorption: item.technicalSpecs.waterAbsorption ?? null,
      compressiveStrength: item.technicalSpecs.compressiveStrength ?? null,
      flexuralStrength: item.technicalSpecs.flexuralStrength ?? null,
      abrasionResistance: item.technicalSpecs.abrasionResistance ?? null,
    } : undefined,
    thicknessOptions: item.thicknessOptions,
    sizeOptions: item.sizeOptions,
    stockStatus: item.stockStatus,
    tags: item.tags,
    seo: seoDTO(item.seo),
  };
}

function projectCard(item: IProject): ProjectCardDTO {
  return {
    id: id(item._id),
    title: item.title,
    slug: item.slug,
    client: item.client,
    location: item.location,
    country: item.country,
    projectType: item.projectType,
    year: item.year,
    description: item.description,
    coverImage: activeMedia(item.coverImage),
  };
}

function blogDTO(item: IBlogPost & { author?: BlogAuthor }): BlogPostDTO {
  return {
    id: id(item._id),
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    category: item.category,
    tags: item.tags,
    readTimeMinutes: item.readTimeMinutes,
    publishedAt: item.publishedAt?.toISOString(),
    coverImage: activeMedia(item.coverImage),
    author: item.author ? { name: item.author.name, role: item.author.role } : undefined,
    seo: seoDTO(item.seo),
  };
}

function pageDTO(item: IPage): PageDTO {
  return {
    id: id(item._id),
    title: item.title,
    slug: item.slug,
    kind: item.kind,
    excerpt: item.excerpt,
    content: item.content,
    coverImage: activeMedia(item.coverImage),
    gallery: activeMediaList(item.gallery),
    sections: item.sections
      .filter((section) => section.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((section) => ({
        key: section.key,
        title: section.title,
        body: section.body,
        items: section.items,
        image: activeMedia(section.image),
        sortOrder: section.sortOrder,
      })),
    seo: seoDTO(item.seo),
  };
}

export const getAllMaterials = cache(async () => {
  await connectDB();
  const categories = await Category.find().activeOnly().sort({ sortOrder: 1, name: 1 }).populate({ path: "coverImage", match: publicFilter });
  return categories.map((item) => ({
    id: id(item._id),
    name: item.name,
    slug: item.slug,
    description: item.description,
    shortDescription: item.shortDescription,
    coverImage: activeMedia(item.coverImage),
    seo: seoDTO(item.seo),
  })) satisfies CategoryCardDTO[];
});

export const getCategoryPage = cache(async (slug: string) => {
  await connectDB();
  const category = await Category.findOne({ slug }).activeOnly().populate({ path: "coverImage", match: publicFilter });
  if (!category) return null;
  const products = await Product.find({ category: category._id }).activeOnly().sort({ sortOrder: 1, name: 1 })
    .populate([{ path: "primaryImage", match: publicFilter }, { path: "category", match: publicFilter, select: "name slug" }]);
  return {
    category: {
      id: id(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description,
      shortDescription: category.shortDescription,
      coverImage: activeMedia(category.coverImage),
      seo: seoDTO(category.seo),
    } satisfies CategoryCardDTO,
    products: products.filter((item) => item.category).map((item) => productCard(item as unknown as ProductWithCategory)),
  };
});

export const getProductPage = cache(async (categorySlug: string, productSlug: string) => {
  await connectDB();
  const category = await Category.findOne({ slug: categorySlug }).activeOnly();
  if (!category) return null;
  const product = await Product.findOne({ slug: productSlug, category: category._id }).activeOnly()
    .populate([
      { path: "category", match: publicFilter, select: "name slug" },
      { path: "primaryImage", match: publicFilter },
      { path: "images", match: publicFilter, options: { sort: { sortOrder: 1 } } },
    ]);
  if (!product || !product.category) return null;
  const related = await Product.find({ category: category._id, _id: { $ne: product._id } }).activeOnly().sort({ sortOrder: 1, name: 1 }).limit(8)
    .populate([{ path: "primaryImage", match: publicFilter }, { path: "category", match: publicFilter, select: "name slug" }]);
  return {
    product: productDetail(product as unknown as ProductWithCategory),
    related: related.filter((item) => item.category).map((item) => productCard(item as unknown as ProductWithCategory)),
  };
});

export const getProjectsPage = cache(async () => {
  await connectDB();
  const projects = await Project.find().activeOnly().sort({ sortOrder: 1, year: -1 }).populate({ path: "coverImage", match: publicFilter });
  return projects.map(projectCard);
});

export const getProjectPage = cache(async (slug: string) => {
  await connectDB();
  const project = await Project.findOne({ slug }).activeOnly().populate([
    { path: "coverImage", match: publicFilter },
    { path: "gallery", match: publicFilter, options: { sort: { sortOrder: 1 } } },
    { path: "materialsUsed", match: publicFilter, populate: [
      { path: "primaryImage", match: publicFilter },
      { path: "category", match: publicFilter, select: "name slug" },
    ] },
  ]);
  if (!project) return null;
  const materials = (project.materialsUsed as unknown as ProductWithCategory[]).filter((item) => item && item.isActive && !item.isDeleted);
  return { ...projectCard(project), gallery: activeMediaList(project.gallery), finishesUsed: project.finishesUsed, materialsUsed: materials.map(productCard), seo: seoDTO(project.seo) } satisfies ProjectDetailDTO;
});

export const getExhibitionsPage = cache(async () => {
  await connectDB();
  const items = await Exhibition.find().activeOnly().sort({ startDate: 1 }).populate({ path: "coverImage", match: publicFilter });
  return items.map((item) => ({
    id: id(item._id), name: item.name, slug: item.slug, venue: item.venue, city: item.city, country: item.country,
    startDate: item.startDate.toISOString(), endDate: item.endDate.toISOString(), description: item.description,
    coverImage: activeMedia(item.coverImage), gallery: [], seo: seoDTO(item.seo),
  })) satisfies ExhibitionDTO[];
});

export const getExhibitionPage = cache(async (slug: string) => {
  await connectDB();
  const item = await Exhibition.findOne({ slug }).activeOnly().populate([
    { path: "coverImage", match: publicFilter },
    { path: "gallery", match: publicFilter, options: { sort: { sortOrder: 1 } } },
  ]);
  if (!item) return null;
  return {
    id: id(item._id), name: item.name, slug: item.slug, venue: item.venue, city: item.city, country: item.country,
    startDate: item.startDate.toISOString(), endDate: item.endDate.toISOString(), description: item.description,
    coverImage: activeMedia(item.coverImage), gallery: activeMediaList(item.gallery), seo: seoDTO(item.seo),
  } satisfies ExhibitionDTO;
});

export const getBlogPosts = cache(async (category?: string) => {
  await connectDB();
  const filter: FilterQuery<IBlogPost> = { isPublished: true, publishedAt: { $lte: now() } };
  if (category) filter.category = category;
  const posts = await BlogPost.find(filter).activeOnly().sort({ publishedAt: -1 }).populate([
    { path: "coverImage", match: publicFilter },
    { path: "author", match: publicFilter, select: "name role" },
  ]);
  return posts.map((item) => blogDTO(item as unknown as IBlogPost & { author?: BlogAuthor }));
});

export const getBlogPost = cache(async (slug: string) => {
  await connectDB();
  const post = await BlogPost.findOne({ slug, isPublished: true, publishedAt: { $lte: now() } }).activeOnly().populate([
    { path: "coverImage", match: publicFilter },
    { path: "author", match: publicFilter, select: "name role" },
  ]);
  if (!post) return null;
  const current = blogDTO(post as unknown as IBlogPost & { author?: BlogAuthor });
  const related = await BlogPost.find({ _id: { $ne: post._id }, category: post.category, isPublished: true, publishedAt: { $lte: now() } }).activeOnly()
    .sort({ publishedAt: -1 }).limit(3).populate({ path: "coverImage", match: publicFilter });
  return { post: current, related: related.map((item) => blogDTO(item as unknown as IBlogPost & { author?: BlogAuthor })) };
});

export const getFaqPage = cache(async () => {
  await connectDB();
  return Faq.find().activeOnly().sort({ sortOrder: 1 }).lean();
});

export const getContentPage = cache(async (slug: string) => {
  await connectDB();
  const page = await Page.findOne({ slug }).activeOnly().populate([
    { path: "coverImage", match: publicFilter },
    { path: "gallery", match: publicFilter, options: { sort: { sortOrder: 1 } } },
    { path: "sections.image", match: publicFilter },
    { path: "seo.ogImage", match: publicFilter },
  ]);
  return page ? pageDTO(page as unknown as IPage) : null;
});

export const getContactSettings = cache(async () => {
  await connectDB();
  return SiteSettings.findOne().activeOnly().lean();
});

export const getQuoteOptions = cache(async () => {
  await connectDB();
  const products = await Product.find().activeOnly().sort({ sortOrder: 1, name: 1 }).populate([{ path: "category", match: publicFilter, select: "name slug" }]);
  return products.filter((item) => item.category).map((item) => productCard(item as unknown as ProductWithCategory));
});

export async function createPublicInquiry(input: {
  name: string; email: string; phone?: string; country?: string; company?: string; inquiryType: "Quote" | "Export" | "General" | "Sample Request" | "Careers";
  productInterest?: string[]; quantity?: string; unit?: string; message: string; source: "Contact Form" | "Quote Form" | "Product Page"; pageUrl?: string;
}) {
  await connectDB();
  const productIds = (input.productInterest ?? []).filter((value) => Types.ObjectId.isValid(value)).map((value) => new Types.ObjectId(value));
  const inquiry = await Inquiry.create({
    name: input.name, email: input.email, phone: input.phone, country: input.country, company: input.company,
    inquiryType: input.inquiryType, productInterest: productIds, quantity: input.quantity, unit: input.unit,
    message: input.message, source: input.source, pageUrl: input.pageUrl, status: "New", isRead: false,
    isActive: true, isDeleted: false, sortOrder: 0, createdBy: null, updatedBy: null,
  });
  return id(inquiry._id);
}

export async function searchPublicContent(query: string, types: string[]) {
  await connectDB();
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  const wanted = new Set(types.length ? types : ["Product", "Project", "Blog"]);
  const tasks: Array<Promise<SearchResultDTO[]>> = [];
  if (wanted.has("Product")) {
    tasks.push(Product.find({ $text: { $search: trimmed } }).activeOnly().limit(12).populate([
      { path: "category", match: publicFilter, select: "name slug" },
      { path: "primaryImage", match: publicFilter },
    ]).then((rows) => rows.filter((item) => item.category).map((item) => {
      const product = productCard(item as unknown as ProductWithCategory);
      return { id: product.id, title: product.name, url: `/materials/${product.categorySlug}/${product.slug}`, type: "Product", excerpt: product.description, image: product.primaryImage } satisfies SearchResultDTO;
    })));
  }
  if (wanted.has("Project")) {
    tasks.push(Project.find({ $text: { $search: trimmed } }).activeOnly().limit(12).populate({ path: "coverImage", match: publicFilter }).then((rows) => rows.map((item) => {
      const project = projectCard(item);
      return { id: project.id, title: project.title, url: `/projects/${project.slug}`, type: "Project", excerpt: project.description, image: project.coverImage } satisfies SearchResultDTO;
    })));
  }
  if (wanted.has("Blog")) {
    tasks.push(BlogPost.find({ $text: { $search: trimmed }, isPublished: true, publishedAt: { $lte: now() } }).activeOnly().limit(12).populate({ path: "coverImage", match: publicFilter }).then((rows) => rows.map((item) => {
      const post = blogDTO(item as unknown as IBlogPost & { author?: BlogAuthor });
      return { id: post.id, title: post.title, url: `/blog/${post.slug}`, type: "Blog", excerpt: post.excerpt, image: post.coverImage } satisfies SearchResultDTO;
    })));
  }
  const results = await Promise.all(tasks);
  return results.flat();
}

export async function getStaticSlugs(collection: "categories" | "products" | "projects" | "exhibitions" | "posts") {
  await connectDB();
  if (collection === "categories") return Category.find().activeOnly().select("slug").lean();
  if (collection === "products") return Product.find().activeOnly().populate({ path: "category", match: publicFilter, select: "slug" }).select("slug category").lean();
  if (collection === "projects") return Project.find().activeOnly().select("slug").lean();
  if (collection === "exhibitions") return Exhibition.find().activeOnly().select("slug").lean();
  return BlogPost.find({ isPublished: true, publishedAt: { $lte: now() } }).activeOnly().select("slug category").lean();
}

export async function getPublicMediaByIds(ids: string[]) {
  await connectDB();
  const objectIds = ids.filter((value) => Types.ObjectId.isValid(value)).map((value) => new Types.ObjectId(value));
  if (!objectIds.length) return [];
  const media = await Media.find({ _id: { $in: objectIds } }).activeOnly().lean();
  return media.map(toMediaDTO);
}
