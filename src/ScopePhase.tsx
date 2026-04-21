import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ScopePhase.module.css';

const EXAMPLES = [
  {
    label: 'IoT dashboard',
    text: 'A smart building management dashboard monitoring temperature, humidity, and occupancy sensors across 50+ buildings. Facility managers need real-time alerts and 90-day trend analysis. ~200 concurrent users, 10,000 sensor readings per minute at peak.',
  },
  {
    label: 'Food delivery',
    text: 'A food delivery platform connecting local restaurants to customers. Core features: menus, ordering, real-time delivery tracking, driver management, and payments. City launch then regional expansion. 1k orders/day at launch, targeting 20k within 18 months.',
  },
  {
    label: 'Collaborative editor',
    text: 'A real-time collaborative document editor similar to Notion. Multiple users editing simultaneously, version history, rich media embeds, and nested pages. Starting with small teams (5-20 users), targeting 100k total users within 2 years.',
  },
  {
    label: 'Healthcare records',
    text: 'A clinic network EHR system managing patient records, appointment scheduling, prescriptions, and lab results. Must be HIPAA-compliant. 50 clinics, ~500 staff users, ~100k patient records growing at 2k/month.',
  },
];

interface Props {
  onStart: (scope: string) => void;
}

export default function ScopePhase({ onStart }: Props) {
  const [scope, setScope] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (scope.trim().length < 50) {
      setError('Give us a bit more detail — at least a sentence or two about your application and its constraints.');
      return;
    }
    setError('');
    onStart(scope.trim());
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.heroText}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.levelZero}>LEVEL 0</div>
        <h1 className={styles.headline}>Define your mission</h1>
        <p className={styles.subhead}>
          Describe the system you want to build. Be specific about users, scale, and constraints — the challenges will be generated around your actual problem, not a generic one.
        </p>
      </motion.div>

      <motion.div
        className={styles.inputCard}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <textarea
          className={styles.textarea}
          value={scope}
          onChange={e => { setScope(e.target.value); setError(''); }}
          placeholder="Describe your application — what it does, who uses it, expected scale, key constraints..."
          rows={6}
        />

        <div className={styles.exampleRow}>
          <span className={styles.exampleLabel}>Try:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              className={styles.examplePill}
              onClick={() => { setScope(ex.text); setError(''); }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.startBtn} onClick={handleSubmit}>
          Generate my challenge levels
          <span className={styles.arrow}>→</span>
        </button>
      </motion.div>

      <motion.div
        className={styles.howItWorks}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        {[
          { num: '01', title: 'Six locked levels', desc: 'Each level is a real architectural decision point. You cannot skip ahead.' },
          { num: '02', title: 'No answer keys', desc: 'The optimal plan is generated and hidden. You discover it by reasoning, not guessing.' },
          { num: '03', title: 'Socratic feedback', desc: 'Every answer triggers questions, not corrections. Minos never tells you what\'s right.' },
          { num: '04', title: 'Mistakes compound', desc: 'Bad early decisions create real constraints in later levels. That\'s the point.' },
        ].map(item => (
          <div key={item.num} className={styles.howCard}>
            <div className={styles.howNum}>{item.num}</div>
            <div className={styles.howTitle}>{item.title}</div>
            <div className={styles.howDesc}>{item.desc}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
