import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppState } from './types';
import { generateJourneySummary } from './api';
import styles from './CompletePhase.module.css';

interface Props {
  state: AppState;
  onRestart: () => void;
}

export default function CompletePhase({ state, onRestart }: Props) {
  const [summary, setSummary] = useState(state.journeySummary || '');
  const [loading, setLoading] = useState(!state.journeySummary);

  useEffect(() => {
    if (state.journeySummary) return;
    generateJourneySummary(state.decisions, state.scope)
      .then(s => setSummary(s))
      .catch(() => setSummary('Unable to generate summary.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.heroSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.crownIcon}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M4 28L8 12L16 20L20 8L24 20L32 12L36 28H4Z" stroke="var(--gold)" strokeWidth="1.5" fill="var(--gold-glow)" />
            <line x1="4" y1="30" x2="36" y2="30" stroke="var(--gold)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className={styles.completedLabel}>ALL LEVELS COMPLETE</div>
        <h1 className={styles.headline}>The maze is solved</h1>
        <p className={styles.sub}>
          You've worked through every architectural decision. Below is the optimal plan the system generated for your application — compare it against the reasoning you developed along the way.
        </p>
      </motion.div>

      {/* Journey reflection */}
      <motion.div
        className={styles.journeyCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className={styles.cardLabel}>Your journey</div>
        {loading ? (
          <div className={styles.thinkingDots}><span /><span /><span /></div>
        ) : (
          <p className={styles.journeyText}>{summary}</p>
        )}

        <div className={styles.decisionsGrid}>
          {state.decisions.map(d => (
            <div key={d.level} className={styles.decisionCard}>
              <div className={styles.decisionNum}>Level {d.level}</div>
              <div className={styles.decisionTitle}>{d.title}</div>
              <p className={styles.decisionSummary}>{d.summary}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Optimal plan reveal */}
      <motion.div
        className={styles.planCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.planHeader}>
          <div className={styles.cardLabel}>Optimal architecture plan</div>
          <div className={styles.vaultUnlocked}>
            <span>⊞</span> Vault unlocked
          </div>
        </div>
        <div className={styles.planText}>{state.optimalPlan}</div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button className={styles.restartBtn} onClick={onRestart}>
          Start a new project
        </button>
        <p className={styles.actionNote}>
          Try a different application — or run this one again and see if your reasoning improves.
        </p>
      </motion.div>
    </div>
  );
}
