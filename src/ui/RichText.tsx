import type { JSX } from 'preact';

/** Renders a paragraph where `**text**` is bold. Nothing else is interpreted. */
export function RichText({ text }: { text: string }): JSX.Element {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <p>{parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))}</p>;
}
