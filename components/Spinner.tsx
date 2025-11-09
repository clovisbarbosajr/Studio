
import React from 'react';

const Spinner = ({ className = '' }: { className?: string }) => (
  <div
    className={`w-4 h-4 border-2 border-[var(--muted)] border-t-[var(--brand)] rounded-full animate-spin ${className}`}
  ></div>
);

export default Spinner;
