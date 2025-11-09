
import React, { useRef, useEffect } from 'react';

const Sparkles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; r: number; p: number; s: number }[] = [];
    let w = 0, h = 0, t = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.round((w * h) / 30000);
      stars = [...Array(count)].map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.7,
        p: Math.random() * Math.PI * 2,
        s: 0.18 + Math.random() * 0.14,
      }));
    };

    let animationFrameId: number;
    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = Math.sin(s.p + t * s.s) * 0.35 + 0.65;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * tw, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 207, 255, ${0.6 * tw})`;
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} id="sparkles" className="fixed inset-0 pointer-events-none opacity-75 z-0" />;
};

export default Sparkles;
