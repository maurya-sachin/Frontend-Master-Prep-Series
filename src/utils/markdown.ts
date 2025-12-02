import { marked } from 'marked';
import hljs from 'highlight.js';

// Configure marked
marked.use({
  breaks: true,
  gfm: true,
});

export function parseMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}

export function highlightCodeBlocks(element: HTMLElement): void {
  const codeBlocks = element.querySelectorAll('pre code');
  codeBlocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
}

export function extractFrontmatter(markdown: string): { frontmatter: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const [, frontmatterStr, content] = match;
  const frontmatter: Record<string, any> = {};

  frontmatterStr.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      frontmatter[key.trim()] = value;
    }
  });

  return { frontmatter, content };
}

export function extractQuestionsFromMarkdown(markdown: string): any[] {
  const questions: any[] = [];
  const questionRegex = /## Question (\d+):\s*(.+?)\n([\s\S]*?)(?=## Question \d+:|$)/g;

  let match;
  while ((match = questionRegex.exec(markdown)) !== null) {
    const [, number, title, content] = match;
    questions.push({
      number: parseInt(number),
      title: title.trim(),
      content: content.trim(),
    });
  }

  return questions;
}
