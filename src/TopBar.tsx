import React from 'react';
import { Phase } from './types';
import styles from './TopBar.module.css';

interface Props {
  phase: Phase;
  currentLevel?: number;
  totalLevels?: number;
  onLogoClick?: () => void;
}

export default function TopBar({ phase, currentLevel = 0, totalLevels = 6, onLogoClick }: Props) {
  return (
    <header className={styles.bar}>
      <button className={styles.logo} onClick={onLogoClick}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.logoIcon}>
          <rect x="2" y="2" width="16" height="16" rx="2" stroke="var(--gold)" strokeWidth="1.2" strokeDasharray="3 2.5" />
          <circle cx="10" cy="10" r="2.5" fill="var(--gold)" />
        </svg>
        <span className={styles.logoText}>MINOS</span>
      </button>

      {phase === 'challenge' && (
        <div className={styles.levelProgress}>
          <span className={styles.levelText}>
            Level {currentLevel + 1} / {totalLevels}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${((currentLevel) / totalLevels) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.right}>
        {phase === 'challenge' && (
          <span className={styles.vaultTag}>answer key locked</span>
        )}
        {phase === 'complete' && (
          <span className={styles.vaultTagOpen}>vault open</span>
        )}
      </div>
    </header>
  );
}
