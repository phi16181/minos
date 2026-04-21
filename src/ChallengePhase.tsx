import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Decision, AppState } from './types';
import { evaluateAnswer, generateHint } from './api';
import styles from './ChallengePhase.module.css';

interface Props {
  state: AppState;
  onUpdate: (patch: Partial<AppState>) => void;
  onComplete: () => void;
}

function DiffBadge({ difficulty }: { difficulty: string }) {
  const cls = difficulty === 'Easy' ? styles.easy : difficulty === 'Medium' ? styles.medium : styles.hard;
  return <span className={`${styles.badge} ${cls}`}>{difficulty}</span>;
}

function LevelPips({ total, current, decisions }: { total: number; current: number; decisions: Decision[] }) {
  return (
    <div className={styles.pips}>
      {Array.from({ length: total }, (_, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <div
            key={i}
            className={`${styles.pip} ${isDone ? styles.pipDone : isActive ? styles.pipActive : styles.pipLocked}`}
            title={isDone ? decisions[i]?.title : isActive ? 'Current' : 'Locked'}
          >
            {isDone ? '✓' : i + 1}
          </div>
        );
      })}
    </div>
  );
}

export default function ChallengePhase({ state, onUpdate, onComplete }: Props) {
  const [answer, setAnswer] = useState('');
  const responseEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const level = state.levels[state.currentLevelIndex];
  const isLastLevel = state.currentLevelIndex === state.levels.length - 1;

  useEffect(() => {
    setAnswer('');
    onUpdate({ hintVisible: false, hintText: '', levelComplete: false });
    // eslint-disable-next-line
  }, [state.currentLevelIndex]);

  useEffect(() => {
    responseEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [state.conversationHistory, state.levelComplete]);

  const handleSubmit = async () => {
    if (answer.trim().length < 20) {
      alert('Explain your reasoning — a few words isn\'t enough for Minos.');
      return;
    }

    const userMsg = answer.trim();
    setAnswer('');

    const newHistory = [
      ...state.conversationHistory,
      { role: 'user' as const, content: userMsg }
    ];

    onUpdate({
      conversationHistory: newHistory,
      submitLoading: true,
    });

    try {
      const { response, verdict } = await evaluateAnswer(userMsg, level, state.scope, state.conversationHistory);

      const updatedHistory = [
        ...newHistory,
        { role: 'assistant' as const, content: response }
      ];

      if (verdict === 'COMPLETE') {
        const summary = userMsg.slice(0, 140) + (userMsg.length > 140 ? '...' : '');
        const newDecision: Decision = {
          level: level.id,
          title: level.title,
          summary,
        };
        onUpdate({
          conversationHistory: updatedHistory,
          submitLoading: false,
          levelComplete: true,
          decisions: [...state.decisions, newDecision],
        });
      } else {
        onUpdate({
          conversationHistory: updatedHistory,
          submitLoading: false,
        });
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    } catch (e: any) {
      onUpdate({ submitLoading: false });
      alert('Error: ' + e.message);
    }
  };

  const handleHint = async () => {
    onUpdate({ hintLoading: true, hintVisible: true });
    try {
      const hint = await generateHint(level, state.conversationHistory, state.scope);
      onUpdate({ hintLoading: false, hintText: hint });
    } catch {
      onUpdate({ hintLoading: false, hintText: level.socratiqueHint });
    }
  };

  const handleNext = () => {
    if (isLastLevel) {
      onComplete();
    } else {
      onUpdate({
        currentLevelIndex: state.currentLevelIndex + 1,
        conversationHistory: [],
        levelComplete: false,
        hintVisible: false,
        hintText: '',
      });
    }
  };

  if (!level) return null;

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Your application</div>
          <p className={styles.sideScope}>{state.scope.slice(0, 220)}{state.scope.length > 220 ? '…' : ''}</p>
        </div>

        <div className={styles.sideSection}>
          <div className={styles.sideLabel}>Progress</div>
          <LevelPips
            total={state.levels.length}
            current={state.currentLevelIndex}
            decisions={state.decisions}
          />
        </div>

        {state.decisions.length > 0 && (
          <div className={styles.sideSection}>
            <div className={styles.sideLabel}>Decisions made</div>
            {state.decisions.map(d => (
              <div key={d.level} className={styles.decisionItem}>
                <div className={styles.decisionLevel}>Level {d.level} — {d.title}</div>
                <div className={styles.decisionSummary}>{d.summary}</div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.sideNote}>
          <span className={styles.sideNoteIcon}>⊘</span>
          The optimal plan is locked. You won't see it until you complete all six levels.
        </div>
      </aside>

      {/* Main challenge area */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentLevelIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            {/* Level header */}
            <div className={styles.levelHeader}>
              <div className={styles.levelMeta}>
                <span className={styles.levelNum}>LEVEL {level.id}</span>
                <DiffBadge difficulty={level.difficulty} />
                {level.topics.map(t => (
                  <span key={t} className={styles.topicTag}>{t}</span>
                ))}
              </div>
              <h2 className={styles.levelTitle}>{level.title}</h2>
            </div>

            {/* Situation */}
            <div className={styles.situationCard}>
              <div className={styles.cardLabel}>Situation</div>
              <p className={styles.situationText}>{level.situation}</p>
            </div>

            {/* Task */}
            <div className={styles.taskCard}>
              <div className={styles.cardLabel}>Your challenge</div>
              <p className={styles.taskText}>{level.task}</p>
            </div>

            {/* Conversation thread */}
            {state.conversationHistory.length > 0 && (
              <div className={styles.thread}>
                {state.conversationHistory.map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.agentBubble}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className={styles.bubbleWho}>
                      {msg.role === 'user' ? 'You' : 'Minos'}
                    </div>
                    <div className={styles.bubbleText}>{msg.content}</div>
                  </motion.div>
                ))}

                {state.submitLoading && (
                  <div className={`${styles.bubble} ${styles.agentBubble}`}>
                    <div className={styles.bubbleWho}>Minos</div>
                    <div className={styles.thinkingDots}>
                      <span /><span /><span />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Level complete banner */}
            <AnimatePresence>
              {state.levelComplete && (
                <motion.div
                  className={styles.completeBanner}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={styles.completeCheck}>✓</div>
                  <div>
                    <div className={styles.completeTitle}>Level {level.id} cleared</div>
                    <div className={styles.completeSub}>Your reasoning on "{level.title}" has been recorded.</div>
                  </div>
                  <button className={styles.nextBtn} onClick={handleNext}>
                    {isLastLevel ? 'Reveal the optimal plan' : 'Next level'}
                    <span>→</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint */}
            <AnimatePresence>
              {state.hintVisible && (
                <motion.div
                  className={styles.hintPanel}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className={styles.hintLabel}>Hint from Minos</div>
                  {state.hintLoading ? (
                    <div className={styles.thinkingDots}><span /><span /><span /></div>
                  ) : (
                    <p className={styles.hintText}>{state.hintText}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area — hidden when level complete */}
            {!state.levelComplete && (
              <div className={styles.inputArea}>
                <textarea
                  ref={textareaRef}
                  className={styles.answerInput}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Think it through here — explain your reasoning, not just the answer..."
                  rows={5}
                  disabled={state.submitLoading}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
                  }}
                />
                <div className={styles.inputRow}>
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={state.submitLoading || answer.trim().length < 5}
                  >
                    {state.submitLoading ? 'Thinking...' : 'Submit answer'}
                    {!state.submitLoading && <span>→</span>}
                  </button>
                  <button
                    className={styles.hintBtn}
                    onClick={handleHint}
                    disabled={state.hintLoading || state.hintVisible}
                  >
                    {state.hintVisible ? 'Hint shown' : 'Get a hint'}
                  </button>
                  <span className={styles.shortcut}>⌘↵ to submit</span>
                </div>
              </div>
            )}

            <div ref={responseEndRef} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
