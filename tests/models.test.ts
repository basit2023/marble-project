import assert from "node:assert/strict";
import test from "node:test";
import mongoose, { Types } from "mongoose";
import {
  User, Media, Category, Product, Project, Exhibition, BlogPost, Testimonial,
  Faq, HomeSection, SiteSettings, NavigationItem, Inquiry, AuditLog, SystemContent,
} from "../src/models";
import { calculateReadTime } from "../src/lib/read-time";
import { linkUrl } from "../src/lib/validation/common";

// No environment, network or persisted fixtures: model validation runs in memory.
const actor = new Types.ObjectId();
const imageId = new Types.ObjectId();
const categoryId = new Types.ObjectId();
const audit = { createdBy: actor, updatedBy: actor };
const image = {
  cloudinaryPublicId: "test/stone", secureUrl: "https://res.cloudinary.com/test/image/upload/stone.jpg",
  format: "jpg", width: 1200, height: 800, bytes: 10000, altText: "White stone slab with grey veins",
  usageContext: "product", uploadedBy: actor, ...audit,
};
const product = {
  name: "Stone", slug: "stone", category: categoryId, description: "Stone description",
  colourFamily: "White", images: [imageId], primaryImage: imageId, ...audit,
};
const exhibition = {
  name: "Exhibition", slug: "exhibition", venue: "Venue", city: "Karachi", country: "Pakistan",
  startDate: new Date(Date.now() + 86400000), endDate: new Date(Date.now() + 172800000),
  description: "Exhibition description", ...audit,
};
const blog = {
  title: "Stone guide", slug: "stone-guide", content: "<p>Stone care guide.</p>",
  author: actor, category: "Stone Care", ...audit,
};

test("all content models accept valid fixtures and apply shared lifecycle defaults", async () => {
  const docs = [
    new User({ name: "Test Admin", email: "ADMIN@example.com", passwordHash: "test-only-hash", ...audit }),
    new Media(image),
    new Category({ name: "Marble", slug: "marble", description: "Marble", ...audit }),
    new Product(product),
    new Project({ title: "Project", slug: "project", location: "Karachi", country: "Pakistan", projectType: "Residential", year: 2026, description: "Project", ...audit }),
    new Exhibition(exhibition),
    new BlogPost(blog),
    new Testimonial({ clientName: "Client", rating: 5, message: "Review", ...audit }),
    new Faq({ question: "Question?", answer: "<p>Answer</p>", ...audit }),
    new HomeSection({ sectionKey: "stats", items: [{ key: "years", value: "20", data: { unit: "years" } }], ...audit }),
    new SiteSettings({ siteName: "Site", ...audit }),
    new NavigationItem({ label: "Home", url: "/", location: "header", ...audit }),
    new Inquiry({ name: "Buyer", email: "buyer@example.com", inquiryType: "Quote", source: "Quote Form", message: "Quote", ...audit }),
    new SystemContent({ key: "error", heading: "Error", body: "Retry", actionLabel: "Retry", seoTitle: "Error", seoDescription: "Retry", ...audit }),
  ];
  for (const doc of docs) {
    await doc.validate();
    assert.ok(doc._id instanceof Types.ObjectId);
    assert.equal(doc.isActive, true);
    assert.equal(doc.isDeleted, false);
    assert.equal(doc.sortOrder, 0);
    assert.ok(doc.createdBy?.equals(actor));
  }
});

test("content indexes and User references exist on every content schema", () => {
  for (const model of [User, Media, Category, Product, Project, Exhibition, BlogPost, Testimonial, Faq, HomeSection, SiteSettings, NavigationItem, Inquiry, SystemContent]) {
    const indexes = model.schema.indexes().map(([keys]) => keys);
    assert.ok(indexes.some((keys) => keys.isActive === 1 && keys.isDeleted === 1 && keys.sortOrder === 1), model.modelName);
    for (const name of ["isActive", "isDeleted", "sortOrder"]) assert.ok(indexes.some((keys) => keys[name] === 1 && Object.keys(keys).length === 1));
    assert.equal(model.schema.paths.createdBy.options.ref, "User");
    assert.equal(model.schema.paths.updatedBy.instance, "ObjectId");
    assert.ok(model.schema.paths.createdAt);
    assert.ok(model.schema.paths.updatedAt);
    assert.equal(mongoose.models[model.modelName], model);
  }
});

test("activeOnly preserves caller constraints and supports find, findOne, count and lean", () => {
  const find = Product.find({ isActive: false }).activeOnly();
  assert.deepEqual(find.getFilter(), { isActive: false, $and: [{ isActive: true, isDeleted: false }] });
  assert.deepEqual(Media.findOne().activeOnly().getFilter(), { $and: [{ isActive: true, isDeleted: false }] });
  assert.deepEqual(Category.countDocuments().activeOnly().getFilter(), { $and: [{ isActive: true, isDeleted: false }] });
  const typedLeanQuery = Product.find().activeOnly().lean();
  assert.ok(typedLeanQuery.getFilter().$and);
});

test("Media rejects blank alt text, external URLs, invalid dimensions and SVG blur payloads", async () => {
  for (const invalid of [
    { altText: "" }, { altText: "   " }, { width: 0 }, { width: 1.5 }, { secureUrl: "https://example.com/image.jpg" },
    { secureUrl: "http://res.cloudinary.com/test/image/upload/a.jpg" }, { blurDataUrl: "data:image/svg+xml;base64,PHN2Zz4=" },
  ]) await assert.rejects(new Media({ ...image, ...invalid }).validate());
  const media = new Media(image);
  assert.ok(media.validateSync() === undefined);
  assert.ok(new Media({ ...image, altText: " " }).validateSync());
});

test("SEO lengths, canonical schemes and Media references are validated", async () => {
  for (const seo of [
    { metaTitle: "x".repeat(61) }, { metaDescription: "x".repeat(161) },
    { canonicalUrl: "javascript:alert(1)" }, { ogImage: "not-an-id" },
  ]) await assert.rejects(new Product({ ...product, seo }).validate());
  const valid = new Product({ ...product, seo: { ogImage: imageId, metaTitle: "x".repeat(60), metaDescription: "x".repeat(160) } });
  await valid.validate();
  assert.equal(valid.seo.noIndex, false);
});

test("Product validates complete price ranges, primary image membership and enums", async () => {
  for (const invalid of [
    { isPriceVisible: true },
    { priceRange: { min: 10, max: 1, currency: "PKR", unit: "sq ft" } },
    { priceRange: { min: -1, max: 1, currency: "PKR", unit: "sq ft" } },
    { primaryImage: new Types.ObjectId() }, { finishes: ["Painted"] }, { colourFamily: "Invalid" },
    { technicalSpecs: { waterAbsorption: 101 } },
  ]) await assert.rejects(new Product({ ...product, ...invalid }).validate());
  await new Product({ ...product, isPriceVisible: true, priceRange: { min: 1, max: 2, currency: "pkr", unit: "sq ft" } }).validate();
});

test("Exhibition date order and dynamic isUpcoming virtual are correct", async () => {
  const upcoming = new Exhibition(exhibition);
  await upcoming.validate();
  assert.equal(upcoming.isUpcoming, true);
  upcoming.startDate = new Date(Date.now() - 86400000);
  assert.equal(upcoming.isUpcoming, false);
  assert.equal(upcoming.toJSON().isUpcoming, false);
  assert.equal(Exhibition.schema.path("isUpcoming"), undefined);
  await assert.rejects(new Exhibition({ ...exhibition, endDate: new Date(0) }).validate());
});

test("Blog reading time ignores scripts and is recalculated when HTML changes", async () => {
  const post = new BlogPost({ ...blog, content: "<p>" + "stone ".repeat(401) + "</p>", readTimeMinutes: 99 });
  await post.validate();
  assert.equal(post.readTimeMinutes, 3);
  post.content = "<p>Short article</p>";
  await post.validate();
  assert.equal(post.readTimeMinutes, 1);
  assert.equal(calculateReadTime("<script>" + "word ".repeat(1000) + "</script><p>Stone.</p>"), 1);
  await assert.rejects(new BlogPost({ ...blog, isPublished: true }).validate());
  await new BlogPost({ ...blog, isPublished: true, publishedAt: new Date() }).validate();
});

test("User normalizes email and omits password hashes from JSON/default selection", async () => {
  const user = new User({ name: "Admin", email: " ADMIN@EXAMPLE.COM ", passwordHash: "test-only-hash", ...audit });
  await user.validate();
  assert.equal(user.email, "admin@example.com");
  assert.equal(User.schema.path("passwordHash").options.select, false);
  assert.equal(JSON.stringify(user).includes("test-only-hash"), false);
  const projected = User.hydrate({ _id: actor, name: "Admin", email: "a@example.com", role: "admin", ...audit }, { passwordHash: 0 });
  await projected.validate();
  await assert.rejects(new User({ name: "Admin", email: "invalid", passwordHash: "test" }).validate());
  await assert.rejects(new User({ name: "Admin", email: "a@example.com", passwordHash: "test", role: "owner" }).validate());
});

test("query content updates cannot bypass full validation or reading-time middleware", async () => {
  await assert.rejects(BlogPost.updateOne({ _id: actor }, { $set: { content: "Changed" } }).exec(), /document.save/);
  await assert.rejects(Product.updateOne({ _id: actor }, { $set: { "priceRange.min": 200 } }).exec(), /document.save/);
  await assert.rejects(SiteSettings.updateOne({}, { $set: { siteName: "New" } }, { upsert: true }).exec(), /create/);
});

test("self-referencing parents, invalid ratings and unsafe navigation links are rejected", async () => {
  const category = new Category({ name: "Marble", slug: "marble", description: "Marble", ...audit });
  category.parentCategory = category._id;
  await assert.rejects(category.validate());
  const item = new NavigationItem({ label: "Home", url: "/", location: "header", ...audit });
  item.parentItem = item._id;
  await assert.rejects(item.validate());
  for (const rating of [0, 6, 2.5]) await assert.rejects(new Testimonial({ clientName: "Client", message: "Review", rating }).validate());
  for (const url of ["javascript:alert(1)", "//evil.example", "/\\evil.example", "data:text/html,test"]) assert.equal(linkUrl.safeParse(url).success, false);
  for (const url of ["/", "/products/stone", "#gallery", "https://example.com", "mailto:a@example.com", "tel:+923001234567"]) assert.equal(linkUrl.safeParse(url).success, true);
});

test("SiteSettings enforces a unique singleton discriminator and nested constraints", async () => {
  assert.ok(SiteSettings.schema.indexes().some(([keys, options]) => keys.singletonKey === 1 && options.unique));
  await assert.rejects(new SiteSettings({ siteName: "Site", singletonKey: "second-site" }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", announcementBar: { isActive: true } }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", addresses: [{ label: "Office", line1: "Street", city: "Karachi", country: "Pakistan", latitude: 24 }] }).validate());
  await assert.rejects(new SiteSettings({ siteName: "Site", socialLinks: [{ platform: "Social", url: "javascript:alert(1)" }] }).validate());
});

test("AuditLog is validated and rejects query updates/deletion", async () => {
  const log = new AuditLog({ user: actor, action: "create", collectionName: "products", documentId: actor, changes: { after: { name: "Stone" } } });
  await log.validate();
  assert.equal(AuditLog.schema.path("updatedAt"), undefined);
  await assert.rejects(new AuditLog({ user: actor, action: "invalid", collectionName: "products" }).validate());
  await assert.rejects(AuditLog.updateOne({}, { $set: { action: "delete" } }).exec(), /append-only/);
  await assert.rejects(AuditLog.deleteMany({}).exec(), /append-only/);
  await assert.rejects(log.deleteOne(), /append-only/);
});

test("required unique/search/publication indexes are declared", () => {
  for (const model of [Category, Product, Project, Exhibition, BlogPost]) {
    assert.ok(model.schema.indexes().some(([keys, options]) => keys.slug === 1 && options.unique));
  }
  assert.ok(Product.schema.indexes().some(([keys]) => keys.name === "text" && keys.description === "text" && keys.tags === "text"));
  assert.ok(BlogPost.schema.indexes().some(([keys]) => keys.publishedAt === -1));
  assert.ok(User.schema.indexes().some(([keys, options]) => keys.email === 1 && options.unique));
  assert.ok(Media.schema.indexes().some(([keys, options]) => keys.cloudinaryPublicId === 1 && options.unique));
});
