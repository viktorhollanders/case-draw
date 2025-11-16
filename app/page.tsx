'use client';

import { useRef, useState } from 'react';
import styles from './page.module.css';

import HeroIntro from '@/components/Hero/Hero';
import Toolbar from '@/components/Toolbar/Toolbar';
import Canvas from '@/components/Canvas/Canvas';
import type { CanvasHandle } from '@/components/Canvas/Canvas';
import { saveImageAction } from './actions/saveImage';

export default function HomePage() {
  const drawRef = useRef<HTMLDivElement | null>(null);

  // --- Drawing State ---
  const [tool, setTool] = useState('brush');
  const [mode, setMode] = useState('source-over');
  const [color, setColor] = useState('#0b6cff');
  const [size, setSize] = useState(6);
  const [opacity, setOpacity] = useState(1);

  // --- Canvas Actions (stubbed for now) ---
  const canvasRef = useRef<CanvasHandle>(null);

  function handleUndo() {
    canvasRef.current?.undo();
  }

  function handleRedo() {
    canvasRef.current?.redo();
  }

  function handleClear() {
    canvasRef.current?.clearCanvas();
  }

  async function handleSaveToGallery() {
    const blob = await canvasRef.current?.exportImageBlob();
    if (!blob) return;

    const res = await saveImageAction(blob);
    console.log('Saved:', res);
  }

  // --- Scroll from intro to drawing ---
  function scrollToDraw() {
    drawRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      {/* Intro Section */}
      <HeroIntro onStart={scrollToDraw} />

      <div ref={drawRef} className={styles.app}>
        <div className={styles.panel}>
          <Toolbar
            onToolChange={setTool}
            onModeChange={setMode}
            onColorChange={setColor}
            onSizeChange={setSize}
            onOpacityChange={setOpacity}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onClear={handleClear}
            onSave={handleSaveToGallery}
          />
        </div>

        <div className={styles.canvasWrap}>
          <div className={styles.stage}>
            <Canvas
              ref={canvasRef}
              width={1200}
              height={800}
              color={color}
              size={size}
              opacity={opacity}
              tool={tool}
              mode={mode}
            />
          </div>
        </div>
      </div>
    </>
  );
}
