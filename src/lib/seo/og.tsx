import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

interface OgCardInput {
  title: string;
  eyebrow?: string;
  siteName: string;
  imageUrl?: string;
}

/** Dynamic Open Graph / Twitter card: title (and optional eyebrow) over a photo. */
export function renderOgImage({ title, eyebrow, siteName, imageUrl }: OgCardInput): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          position: "relative",
          backgroundColor: "#131313",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- rendered by Satori inside ImageResponse, not the browser
          <img
            src={imageUrl}
            alt=""
            width={OG_SIZE.width}
            height={OG_SIZE.height}
            style={{ position: "absolute", inset: 0, objectFit: "cover", opacity: 0.4 }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(120deg, rgba(19,19,19,0.95) 20%, rgba(19,19,19,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            padding: 80,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, textTransform: "uppercase", color: "#cbb98a" }}>
            {eyebrow ?? siteName}
          </div>
          <div style={{ display: "flex", fontSize: 68, lineHeight: 1.1, fontWeight: 600, maxWidth: 1000 }}>
            {title.length > 120 ? `${title.slice(0, 117)}…` : title}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.7)" }}>{siteName}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
