import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppState } from './types';
import { generatePlanAndLevels } from './api';
import ScopePhase from './ScopePhase';
import GeneratingPhase from './GeneratingPhase';
import ChallengePhase from './ChallengePhase';
import CompletePhase from './CompletePhase';
import TopBar from './TopBar';
import './index.css';

const INITIAL_STATE: AppState = {
  phase: 'scope',
  scope: '',
  optimalPlan: '',
  levels: [],
  currentLevelIndex: 0,
  decisions: [],
  conversationHistory: [],
  levelComplete: false,
  hintVisible: false,
  hintText: '',
  hintLoading: false,
  submitLoading: false,
  journeySummary: '',
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const update = (patch: Partial<AppState>) =>
    setState(s => ({ ...s, ...patch }));

  const handleStart = async (scope: string) => {
    update({ phase: 'generating', scope });
    try {
      const { optimalPlan, levels } = await generatePlanAndLevels(scope);
      update({
        phase: 'challenge',
        optimalPlan,
        levels,
        currentLevelIndex: 0,
        decisions: [],
        conversationHistory: [],
        levelComplete: false,
        hintVisible: false,
        hintText: '',
      });
    } catch (e: any) {
      alert('Error generating challenges: ' + e.message + '\n\nPlease check your API key and try again.');
      update({ phase: 'scope' });
    }
  };

  const handleComplete = () => update({ phase: 'complete' });
  const handleRestart = () => setState(INITIAL_STATE);

  return (
    <>
      <TopBar
        phase={state.phase}
        currentLevel={state.currentLevelIndex}
        totalLevels={state.levels.length || 6}
        onLogoClick={state.phase !== 'scope' && state.phase !== 'generating' ? handleRestart : undefined}
      />
      <AnimatePresence mode="wait">
        {state.phase === 'scope' && (
          <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ScopePhase onStart={handleStart} />
          </motion.div>
        )}
        {state.phase === 'generating' && (
          <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GeneratingPhase />
          </motion.div>
        )}
        {state.phase === 'challenge' && (
          <motion.div key="challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChallengePhase state={state} onUpdate={update} onComplete={handleComplete} />
          </motion.div>
        )}
        {state.phase === 'complete' && (
          <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompletePhase state={state} onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
