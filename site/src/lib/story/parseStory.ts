// Splits the rendered story markdown into the pieces the page lays out on its own:
// title (#), dek (first paragraph), sections (##) and their subsections (###).
import { marked } from 'marked';

export interface StoryBlock {
  heading: string;
  html: string;
}
export interface StorySection extends StoryBlock {
  subsections: StoryBlock[];
}
export interface ParsedStory {
  title: string;
  dek: string;
  sections: StorySection[];
}

const toHtml = (md: string) => marked.parse(md.trim(), { async: false });
const inline = (md: string) => marked.parseInline(md.trim(), { async: false });

function splitBy(md: string, marker: string): { heading: string | null; body: string }[] {
  const out: { heading: string | null; body: string }[] = [{ heading: null, body: '' }];
  for (const line of md.split(/\r?\n/)) {
    if (line.startsWith(marker)) out.push({ heading: line.slice(marker.length).trim(), body: '' });
    else out[out.length - 1]!.body += `${line}\n`;
  }
  return out;
}

export function parseStory(markdown: string): ParsedStory {
  const titleMatch = markdown.match(/^# (.+)$/m);
  if (!titleMatch) throw new Error('Story has no "# " title');
  const afterTitle = markdown.slice(markdown.indexOf(titleMatch[0]) + titleMatch[0].length);
  const [intro, ...rest] = splitBy(afterTitle, '## ');
  const sections = rest.map(({ heading, body }) => {
    const [lead, ...subs] = splitBy(body, '### ');
    return {
      heading: inline(heading ?? ''),
      html: toHtml(lead?.body ?? ''),
      subsections: subs.map((s) => ({ heading: inline(s.heading ?? ''), html: toHtml(s.body) })),
    };
  });
  const dek = (intro?.body ?? '').trim().replace(/^_(.*)_$/s, '$1');
  return { title: inline(titleMatch[1]!), dek: inline(dek), sections };
}
