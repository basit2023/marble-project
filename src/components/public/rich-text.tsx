export function RichText({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
