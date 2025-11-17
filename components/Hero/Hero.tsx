'use client';

import Link from 'next/link';

import styles from './Hero.module.css';

export default function HeroIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.hero}>
      <div className={styles.button_container}>
        <button type="button" className={styles.button} onClick={onStart}>
          Click to start drawing
        </button>
        <Link href="/gallery" className={styles.button}>
          View Gallery
        </Link>
      </div>
    </div>
  );
}
