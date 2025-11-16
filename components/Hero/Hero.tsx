'use client';

import Link from 'next/link';

import styles from './Hero.module.css';

export default function HeroIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.hero}>
      <h1>Welcom to the grate wilderness!</h1>
      <p>Do you hear them all the aniamls</p>
      <div className={styles.button_container}>
        <button type="button" className={styles.button} onClick={onStart}>
          click here to Start Drawing or whatever
        </button>
        <Link href="/gallery" className={styles.button}>
          View Gallery
        </Link>
      </div>
    </div>
  );
}
