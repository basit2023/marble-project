export type ScreenKey = "foundation" | "error" | "notFound" | "loading";
export interface ScreenCopy {
  heading: string;
  body: string;
  actionLabel: string;
  seoTitle: string;
  seoDescription: string;
}
export type SystemCopy = Partial<Record<ScreenKey, ScreenCopy>>;

