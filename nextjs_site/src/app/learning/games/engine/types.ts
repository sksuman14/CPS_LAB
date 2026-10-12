import React from 'react';

export interface GameState {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  text: string;
  active: boolean;
  [key: string]: any;
}

export interface LevelResult {
  passed: boolean;
  message: string;
  stars: number;
}

export interface LevelConfig {
  id: string;
  title: string;
  icon: string;
  color: string;
  simBg: string;
  
  concept: string;
  mission: string;
  question: string;
  
  startXml: string;
  solutionXml: string;
  solutions: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  toolbox: any;
  
  maxBlocksForThreeStars: number;
  hints: string[];
  successStory: string;
  
  // Engine functions
  init: () => GameState;
  api: (
    getState: () => GameState,
    updateState: (partial: Partial<GameState>) => void,
    delay: (ms: number) => Promise<void>
  ) => Record<string, any>;
  check: (state: GameState, blockCount: number) => LevelResult;
  
  // Optional Scene if we want to extract it
  Scene?: React.ComponentType<{ state: GameState }>;
}
