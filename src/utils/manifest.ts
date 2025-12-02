import type { Manifest } from '../types';

export async function loadManifest(): Promise<Manifest> {
  try {
    const response = await fetch('/manifest.json');
    if (!response.ok) {
      throw new Error('Failed to load manifest');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading manifest:', error);
    return {};
  }
}

export async function loadMarkdownFile(path: string): Promise<string> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error loading ${path}:`, error);
    throw error;
  }
}

export async function loadFlashcardDeck(deckPath: string): Promise<any[]> {
  try {
    const content = await loadMarkdownFile(deckPath);
    return parseFlashcards(content);
  } catch (error) {
    console.error(`Error loading flashcard deck ${deckPath}:`, error);
    return [];
  }
}

function parseFlashcards(markdown: string): any[] {
  const cards: any[] = [];
  const questionRegex = /## Question (\d+):\s*(.+?)\n([\s\S]*?)(?=## Question \d+:|$)/g;

  let match;
  while ((match = questionRegex.exec(markdown)) !== null) {
    const [, number, title, content] = match;

    // Extract Q and A
    const qaRegex = /\*\*Q:\*\*\s*([\s\S]*?)\n\*\*A:\*\*/;
    const qaMatch = content.match(qaRegex);

    if (qaMatch) {
      cards.push({
        Q: qaMatch[1].trim(),
        A: content.substring(content.indexOf('**A:**') + 6).trim(),
        title: title.trim(),
        number: parseInt(number),
      });
    }
  }

  return cards;
}
