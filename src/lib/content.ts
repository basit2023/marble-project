import "server-only";
import { cache } from "react";
import { connectDB } from "@/lib/db";
import { SystemContent } from "@/models/system-content";
import type { SystemCopy, ScreenKey } from "@/types/content";

export const getSystemCopy = cache(async (): Promise<SystemCopy> => {
  try {
    await connectDB();
    const records = await SystemContent.find().activeOnly().sort({ sortOrder: 1 }).lean().exec();
    return Object.fromEntries(records.map((record) => [record.key as ScreenKey, {
      heading: record.heading, body: record.body, actionLabel: record.actionLabel,
      seoTitle: record.seoTitle, seoDescription: record.seoDescription,
    }]));
  } catch {
    console.error("System content unavailable.");
    // No hardcoded substitute copy; a database outage renders a silent shell.
    return {};
  }
});
