import type { Manifest } from '../types';

export async function loadManifest(): Promise<Manifest> {
  try {
    // Use Vite base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${baseUrl}manifest.json`);
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
    // Use Vite base URL for GitHub Pages compatibility
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Handle paths that start with / by removing the leading slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const response = await fetch(`${baseUrl}${cleanPath}`);
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
  // Match ## Card N: Title format
  const cardRegex = /## Card (\d+):\s*(.+?)\n([\s\S]*?)(?=## Card \d+:|---\s*$|$)/g;

  let match;
  while ((match = cardRegex.exec(markdown)) !== null) {
    const [, number, title, content] = match;

    // Extract Q and A
    const qMatch = content.match(/\*\*Q:\*\*\s*([\s\S]*?)(?=\*\*A:\*\*)/);
    const aMatch = content.match(/\*\*A:\*\*\s*([\s\S]*?)(?=\*\*Difficulty|\*\*Tags|$)/);

    // Extract difficulty
    const difficultyMatch = content.match(/\*\*Difficulty:\*\*\s*([🟢🟡🔴]\s*\w+)/);

    if (qMatch && aMatch) {
      cards.push({
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
        title: title.trim(),
        number: parseInt(number),
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : 'Medium',
      });
    }
  }

  return cards;
}
