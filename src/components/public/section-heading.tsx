export function SectionHeading({ eyebrow, heading, subheading }: { eyebrow?: string; heading?: string; subheading?: string }) {
  return <header className="mb-10 max-w-3xl">{eyebrow && <p className="editorial-label mb-4 text-accent">{eyebrow}</p>}
    {heading && <h2 className="font-heading text-title">{heading}</h2>}{subheading && <p className="mt-5 max-w-2xl text-body leading-8 text-muted">{subheading}</p>}</header>;
}
