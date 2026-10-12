import { smartGreenhouseLevel } from './smart-greenhouse';
import { lineFollowerLevel } from './line-follower';
import { LevelConfig } from '../engine/types';

export const LEVEL_REGISTRY: Record<string, LevelConfig> = {
  'smart-greenhouse': smartGreenhouseLevel,
  'line-follower': lineFollowerLevel,
};
