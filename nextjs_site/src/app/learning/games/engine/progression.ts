interface LevelProgress {
  completed: boolean;
  stars: number;
  attempts: number;
  hintsUsed: number;
}

interface GlobalProgress {
  xp: number;
  level: number;
  badges: string[];
}

export interface ProgressData {
  levels: Record<string, LevelProgress>;
  global: GlobalProgress;
}

const STORAGE_KEY_PREFIX = 'cps-coding-adventures-';

const DEFAULT_PROGRESS: ProgressData = {
  levels: {},
  global: {
    xp: 0,
    level: 1,
    badges: [],
  },
};

function getStorageKey(userKey: string) {
  return `${STORAGE_KEY_PREFIX}${userKey || 'guest'}`;
}

export function getProgress(userKey: string): ProgressData {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const saved = localStorage.getItem(getStorageKey(userKey));
    return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  } catch (e) {
    console.error('Failed to load progress', e);
    return DEFAULT_PROGRESS;
  }
}

function saveProgress(userKey: string, data: ProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userKey), JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

export function saveLevel(userKey: string, id: string, stars: number, hintsUsed: number): { xpEarned: number; newBadges: string[] } {
  const progress = getProgress(userKey);
  
  if (!progress.levels[id]) {
    progress.levels[id] = { completed: false, stars: 0, attempts: 0, hintsUsed: 0 };
  }
  
  progress.levels[id].attempts += 1;
  const isFirstCompletion = !progress.levels[id].completed;
  progress.levels[id].completed = true;
  
  // Update stats if better
  if (stars > progress.levels[id].stars) {
    progress.levels[id].stars = stars;
  }
  
  progress.levels[id].hintsUsed = hintsUsed;

  const xpEarned = stars * 100;
  progress.global.xp += xpEarned;

  let nextLevelThreshold = progress.global.level * 500;
  while (progress.global.xp >= nextLevelThreshold) {
    progress.global.level += 1;
    nextLevelThreshold = progress.global.level * 500;
  }

  const newBadges: string[] = [];
  const checkBadge = (badge: string, condition: boolean) => {
    if (condition && !progress.global.badges.includes(badge)) {
      progress.global.badges.push(badge);
      newBadges.push(badge);
    }
  };

  const completedCount = Object.values(progress.levels).filter(l => l.completed).length;
  const perfectionistCount = Object.values(progress.levels).filter(l => l.stars === 3).length;

  checkBadge('first-win', completedCount > 0);
  checkBadge('three-stars', stars === 3);
  checkBadge('no-hints', hintsUsed === 0);
  checkBadge('five-streak', completedCount >= 5);
  checkBadge('perfectionist', perfectionistCount >= 5);

  saveProgress(userKey, progress);
  
  return { xpEarned, newBadges };
}

export function getXP(userKey: string): number {
  return getProgress(userKey).global.xp;
}

export function getBadges(userKey: string): string[] {
  return getProgress(userKey).global.badges;
}

export function resetProgress(userKey: string): void {
  saveProgress(userKey, DEFAULT_PROGRESS);
}
