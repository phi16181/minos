import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './GeneratingPhase.module.css';

const STEPS = [
  'Analyzing application requirements...',
  'Generating optimal architecture plan...',
  'Designing challenge sequence...',
  'Calibrating Socratic difficulty...',
  'Sealing the answer key in the vault...',
];

export default function GeneratingPhase() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.mazeIcon}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="4" y="4" width="40" height="40" rx="4" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="10" y="10" width="28" height="28" rx="2" stroke="var(--gold-dim)" strokeWidth="1" />
            <circle cx="24" cy="24" r="4" fill="var(--gold)" />
          </svg>
        </div>

        <h2 className={styles.title}>Building your maze</h2>
        <p className={styles.sub}>The optimal plan is being generated and locked away. Your challenges are being tailored to your application.</p>

        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step}
              className={`${styles.step} ${i < stepIndex ? styles.done : i === stepIndex ? styles.active : styles.waiting}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= stepIndex ? 1 : 0.3, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <span className={styles.dot}>
                {i < stepIndex ? '✓' : i === stepIndex ? '›' : '·'}
              </span>
              <span>{step}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
