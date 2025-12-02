import type { StudyProgress, StudySession } from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'frontend-master-progress',
  SESSION: 'frontend-master-session',
  THEME: 'frontend-master-theme',
} as const;

export function getStudyProgress(): StudyProgress {
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!stored) {
    return {
      lastStudied: '',
      totalCards: 0,
      masteredCards: 0,
      streak: 0,
    };
  }
  return JSON.parse(stored);
}

export function saveStudyProgress(progress: StudyProgress): void {
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
}

export function getSession(): StudySession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
  return stored ? JSON.parse(stored) : null;
}

export function saveSession(session: StudySession): void {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return (stored as 'light' | 'dark') || 'dark';
}

export function saveTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function updateStreak(): void {
  const progress = getStudyProgress();
  const today = new Date().toISOString().split('T')[0];
  const lastStudied = progress.lastStudied;

  if (!lastStudied) {
    progress.streak = 1;
  } else {
    const lastDate = new Date(lastStudied);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, don't update streak
      return;
    } else if (diffDays === 1) {
      // Consecutive day
      progress.streak += 1;
    } else {
      // Streak broken
      progress.streak = 1;
    }
  }

  progress.lastStudied = today;
  saveStudyProgress(progress);
}
