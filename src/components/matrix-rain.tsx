"use client";

import { useEffect, useRef } from "react";

export function MatrixRain({ opacity = 0.07 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const charSize = 14;
    let columns: number[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      const cols = Math.floor(window.innerWidth / charSize);
      columns = new Array(cols).fill(0).map(() => Math.random() * window.innerHeight);
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ0123456789ABCDEF{};</>$#&*";

    const draw = () => {
      ctx.fillStyle = "rgba(10, 14, 10, 0.08)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.fillStyle = `rgba(0, 255, 65, ${opacity})`;
      ctx.font = `${charSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < columns.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * charSize, columns[i]);
        if (columns[i] > window.innerHeight && Math.random() > 0.975) columns[i] = 0;
        else columns[i] = columns[i] + charSize;
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [opacity]);

  const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none -z-10" aria-hidden />;
}
