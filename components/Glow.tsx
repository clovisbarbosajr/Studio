
import React, { useRef, useCallback, ReactNode } from 'react';

interface GlowProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Glow: React.FC<GlowProps> = ({ children, className = '', as: Component = 'div', ...props }) => {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      ref.current.style.setProperty('--spot-x', `${x}%`);
      ref.current.style.setProperty('--spot-y', `${y}%`);

      const MAX_TILT = 8;
      const dx = (x / 50) - 1;
      const dy = (y / 50) - 1;
      ref.current.style.transform = `perspective(1000px) rotateX(${-MAX_TILT * dy}deg) rotateY(${MAX_TILT * dx}deg)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
  }, []);

  return (
    <Component
      ref={ref}
      className={`${className} glow transition-transform duration-100 ease-out`}
      style={{ transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Glow;
