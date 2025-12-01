"use client";

import { useEffect, useRef } from "react";

export function WaveformVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "rgba(108, 43, 217, 0.05)");
      gradient.addColorStop(0.5, "rgba(214, 93, 242, 0.03)");
      gradient.addColorStop(1, "rgba(59, 130, 246, 0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw animated waveform
      const centerY = canvas.height / 2;
      const barCount = 120;
      const barWidth = canvas.width / barCount;

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const frequency = Math.sin(i * 0.02 + time * 0.05) * 30;
        const amplitude = Math.sin(i * 0.1 + time * 0.03) * 40 + 50;
        const height =
          Math.abs(Math.sin(i * 0.05 + time * 0.02)) * amplitude + frequency;

        // Gradient per bar
        const barGradient = ctx.createLinearGradient(
          x,
          centerY - height,
          x,
          centerY + height,
        );
        barGradient.addColorStop(0, "rgba(108, 43, 217, 0)");
        barGradient.addColorStop(0.5, "rgba(214, 93, 242, 0.8)");
        barGradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        ctx.fillStyle = barGradient;
        ctx.fillRect(x + 1, centerY - height / 2, barWidth - 2, height);
      }

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}
