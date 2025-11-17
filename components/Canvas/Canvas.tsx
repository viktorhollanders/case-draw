'use client';

import {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  MouseEvent as ReactMouseEvent,
} from 'react';

export interface CanvasHandle {
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  exportImageBlob: () => Promise<Blob | null>;
}

export interface CanvasProps {
  width: number;
  height: number;
  color: string;
  size: number;
  opacity: number;
  tool: string;
  mode: string;
}

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  tool: string;
  color: string;
  size: number;
  opacity: number;
  mode: string;
  points: StrokePoint[];
}

const SNAPSHOT_INTERVAL = 5;

const Canvas = forwardRef<CanvasHandle, CanvasProps>(function Canvas(
  { width, height, color, size, opacity, tool, mode },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const previewCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawing = useRef(false);
  const strokesRef = useRef<Stroke[]>([]);
  const redoStack = useRef<Stroke[]>([]);
  const snapshotsRef = useRef<string[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  const bgImage = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preview = previewCanvasRef.current;

    if (!canvas || !preview) return;

    canvas.width = width;
    canvas.height = height;

    preview.width = width;
    preview.height = height;

    const ctx = canvas.getContext('2d');
    const pctx = preview.getContext('2d');

    if (!ctx || !pctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctxRef.current = ctx;
    previewCtxRef.current = pctx;

    const img = new Image();
    img.src = '/background.png';

    img.onload = () => {
      bgImage.current = img;
      ctx.drawImage(img, 0, 0, width, height);
    };

    img.onerror = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      bgImage.current = null;
    };

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }, [width, height]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;

    ctx.globalCompositeOperation = (
      tool === 'eraser' ? 'destination-out' : mode
    ) as GlobalCompositeOperation;
  }, [color, size, opacity, tool, mode]);

  function handleMouseDown(e: ReactMouseEvent<HTMLCanvasElement>) {
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    isDrawing.current = true;

    currentStroke.current = {
      tool,
      color,
      size,
      opacity,
      mode,
      points: [{ x, y }],
    };

    if (tool === 'brush' || tool === 'eraser') {
      ctxRef.current?.beginPath();
      ctxRef.current?.moveTo(x, y);
    }
  }

  function handleMouseMove(e: ReactMouseEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;

    const stroke = currentStroke.current!;
    const ctx = ctxRef.current!;
    const pctx = previewCtxRef.current!;

    stroke.points.push({ x, y });

    // Brush / eraser: draw direct
    if (tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      return;
    }

    // Shapes: draw on preview canvas
    pctx.clearRect(0, 0, width, height);

    pctx.strokeStyle = color;
    pctx.lineWidth = size;
    pctx.globalAlpha = opacity;

    const start = stroke.points[0];

    if (tool === 'line') {
      pctx.beginPath();
      pctx.moveTo(start.x, start.y);
      pctx.lineTo(x, y);
      pctx.stroke();
    }

    if (tool === 'rect') {
      pctx.strokeRect(start.x, start.y, x - start.x, y - start.y);
    }

    if (tool === 'circle') {
      const radius = Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2);
      pctx.beginPath();
      pctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      pctx.stroke();
    }
  }

  function handleMouseUp() {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const stroke = currentStroke.current!;
    const ctx = ctxRef.current!;
    const pctx = previewCtxRef.current!;

    // Commit shape strokes
    if (tool !== 'brush' && tool !== 'eraser') {
      drawStrokeOn(ctx, stroke);
      pctx.clearRect(0, 0, width, height);
    }

    strokesRef.current.push(stroke);

    // Save snapshot for performance
    if (strokesRef.current.length % SNAPSHOT_INTERVAL === 0) {
      const canvas = canvasRef.current!;
      snapshotsRef.current.push(canvas.toDataURL());
    }

    redoStack.current = [];
  }

  function drawStrokeOn(ctx: CanvasRenderingContext2D, s: Stroke) {
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.globalAlpha = s.opacity;
    ctx.globalCompositeOperation = (
      s.tool === 'eraser' ? 'destination-out' : s.mode
    ) as GlobalCompositeOperation;

    const pts = s.points;
    const start = pts[0];
    const end = pts[pts.length - 1];

    if (s.tool === 'brush' || s.tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      return;
    }

    if (s.tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    if (s.tool === 'rect') {
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    }

    if (s.tool === 'circle') {
      const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    if (bgImage.current) {
      ctx.drawImage(bgImage.current, 0, 0, width, height);
    } else {
      ctx.fillStyle = '#ffffff'; // fallback color
      ctx.fillRect(0, 0, width, height);
    }

    for (const s of strokesRef.current) {
      drawStrokeOn(ctx, s);
    }
  }

  useImperativeHandle(ref, () => ({
    undo() {
      if (strokesRef.current.length === 0) return;
      redoStack.current.push(strokesRef.current.pop()!);
      redraw();
    },
    redo() {
      if (redoStack.current.length === 0) return;
      strokesRef.current.push(redoStack.current.pop()!);
      redraw();
    },
    clearCanvas() {
      strokesRef.current = [];
      redoStack.current = [];
      snapshotsRef.current = [];

      const ctx = ctxRef.current;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      redraw();
    },
    exportImageBlob(): Promise<Blob | null> {
      return new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(null);

        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    },
  }));

  return (
    <div className="canvasContainer">
      <canvas
        ref={canvasRef}
        className="canvasElement"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
      />

      <canvas ref={previewCanvasRef} className="canvasElement previewCanvas" />
    </div>
  );
});

export default Canvas;
