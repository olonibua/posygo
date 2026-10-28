"use client";

import { type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

const WIDTH = 560;
const HEIGHT = 180;
const INK = "#1e3a6e";

export function exportTypedSignature(name: string): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  const font = `72px "Great Vibes"`;
  return document.fonts
    .load(font)
    .catch(() => undefined)
    .then(() => {
      if (!context) {
        return "";
      }
      let size = 72;
      context.font = font;
      while (context.measureText(name).width > WIDTH - 40 && size > 28) {
        size -= 4;
        context.font = `${size}px "Great Vibes"`;
      }
      context.fillStyle = INK;
      context.textBaseline = "middle";
      context.textAlign = "center";
      context.fillText(name, WIDTH / 2, HEIGHT / 2 + 6);
      return canvas.toDataURL("image/png");
    });
}

interface DrawPadProps {
  onChange: (image: string | null) => void;
}

export function DrawPad({ onChange }: DrawPadProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    if (context) {
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = INK;
      context.lineWidth = 3.2;
    }
  }, []);

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: ((event.clientX - box.left) / box.width) * WIDTH, y: ((event.clientY - box.top) / box.height) * HEIGHT };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    last.current = point(event);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = canvas.current?.getContext("2d");
    if (!drawing.current || !context || !last.current) {
      return;
    }
    const next = point(event);
    const mid = { x: (last.current.x + next.x) / 2, y: (last.current.y + next.y) / 2 };
    context.beginPath();
    context.moveTo(last.current.x, last.current.y);
    context.quadraticCurveTo(last.current.x, last.current.y, mid.x, mid.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    last.current = next;
    if (empty) {
      setEmpty(false);
    }
  };

  const end = () => {
    if (!drawing.current) {
      return;
    }
    drawing.current = false;
    last.current = null;
    if (!empty && canvas.current) {
      onChange(canvas.current.toDataURL("image/png"));
    }
  };

  const clear = useCallback(() => {
    const context = canvas.current?.getContext("2d");
    context?.clearRect(0, 0, WIDTH, HEIGHT);
    setEmpty(true);
    onChange(null);
  }, [onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative rounded-control border-[1.5px] border-dashed border-line-strong bg-white">
        <canvas
          ref={canvas}
          width={WIDTH}
          height={HEIGHT}
          aria-label="Draw your signature here with your finger or mouse"
          className="block h-[150px] w-full touch-none cursor-crosshair sm:h-[180px]"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-9 border-b border-line-strong" />
        <span aria-hidden className="pointer-events-none absolute bottom-10 left-6 text-[22px] leading-none text-ink-faint">
          ×
        </span>
        {empty ? (
          <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-small text-ink-faint">
            Sign here with your finger or mouse
          </span>
        ) : null}
      </div>
      <button type="button" onClick={clear} className="self-end text-small font-medium text-ink underline-offset-2 hover:underline">
        Clear
      </button>
    </div>
  );
}
