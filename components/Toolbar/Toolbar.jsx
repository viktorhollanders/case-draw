'use client';

import { useState } from 'react';
import styles from './Toolbar.module.css';

export default function Toolbar({
  onToolChange,
  onModeChange,
  onColorChange,
  onSizeChange,
  onOpacityChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
}) {
  const [size, setSize] = useState(6);
  const [opacity, setOpacity] = useState(1);

  return (
    <div className={styles.toolbarContainer}>
      {/* Tool Selection */}
      <div className={styles.control}>
        <label htmlFor="tool">Tool</label>
        <select id="tool" className={styles.select} onChange={(e) => onToolChange(e.target.value)}>
          <option value="brush">Brush</option>
          <option value="line">Line</option>
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="fill">Fill</option>
          <option value="eraser">Eraser</option>
          <option value="text">Text</option>
        </select>
      </div>

      {/* Mode */}
      <div className={styles.control}>
        <label htmlFor="mode">Mode</label>
        <select id="mode" className={styles.select} onChange={(e) => onModeChange(e.target.value)}>
          <option value="source-over">Draw</option>
          <option value="multiply">Multiply</option>
          <option value="screen">Screen</option>
          <option value="lighter">Lighter</option>
        </select>
      </div>

      {/* Color */}
      <div className={styles.control}>
        <label htmlFor="color">Color</label>
        <input
          id="color"
          type="color"
          className={styles.colorInput}
          defaultValue="#0b6cff"
          onChange={(e) => onColorChange(e.target.value)}
        />
      </div>

      {/* Size */}
      <div className={styles.control}>
        <label htmlFor="size">Size</label>
        <input
          id="size"
          type="range"
          min="1"
          max="120"
          value={size}
          className={styles.rangeInput}
          onChange={(e) => {
            setSize(e.target.value);
            onSizeChange(Number(e.target.value));
          }}
        />
        <div className={styles.small}>{size}</div>
      </div>

      {/* Opacity */}
      <div className={styles.control}>
        <label htmlFor="opacity">Opacity</label>
        <input
          id="opacity"
          type="range"
          min="0.05"
          max="1"
          step="0.05"
          value={opacity}
          className={styles.rangeInput}
          onChange={(e) => {
            setOpacity(e.target.value);
            onOpacityChange(Number(e.target.value));
          }}
        />
        <div className={styles.small}>{opacity}</div>
      </div>

      {/* Buttons */}
      <div className={styles.toolbarRow}>
        <button type="button" className={styles.button} onClick={onUndo}>
          Undo
        </button>
        <button type="button" className={styles.button} onClick={onRedo}>
          Redo
        </button>
      </div>
      <button type="button" className={`${styles.button} ${styles.exportBtn}`} onClick={onSave}>
        Save to gallery
      </button>
      <button type="button" className={`${styles.button} ${styles.clearBtn}`} onClick={onClear}>
        Clear
      </button>
    </div>
  );
}
