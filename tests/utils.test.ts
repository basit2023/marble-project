import assert from "node:assert/strict";
import test from "node:test";
import { buildWhatsAppLink, cn, formatDate, slugify, truncate } from "../src/lib/utils";

test("WhatsApp encodes Unicode and reserved query characters", () => {
  const message = "سنگ & slabs? #1";
  const url = new URL(buildWhatsAppLink(message, "923001234567"));
  assert.equal(url.searchParams.get("text"), message);
  assert.throws(() => buildWhatsAppLink("hello", "+92 300"));
});
test("text helpers handle Unicode, invalid bounds and conflicting classes", () => {
  assert.equal(slugify("  Crème & سنگ  "), "creme-سنگ");
  assert.equal(truncate("😀stone", 3), "😀s…");
  assert.throws(() => truncate("stone", 0));
  assert.equal(cn("px-2", false && "hidden", "px-4"), "px-4");
  assert.throws(() => formatDate("not-a-date"));
});
