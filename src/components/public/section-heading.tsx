export function SectionHeading({ eyebrow, heading, subheading }: { eyebrow?: string; heading?: string; subheading?: string }) {
  return <header className="mb-10 max-w-3xl">
    <div className="mb-5 flex items-center gap-4">
      <span className="gold-rule" aria-hidden="true" />
      {eyebrow && <p className="editorial-label text-accent">{eyebrow}</p>}
    </div>
    {heading && <h2 className="font-heading text-title uppercase">{heading}</h2>}
    {subheading && <p className="mt-5 max-w-2xl text-body leading-8 text-muted">{subheading}</p>}
  </header>;
}
