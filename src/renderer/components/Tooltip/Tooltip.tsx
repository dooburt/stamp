/* eslint-disable react/prop-types */
import React, { memo } from 'react';

export type TooltipProps = {
  children: React.ReactNode;
  text: string;
};

const Tooltip: React.FC<TooltipProps> = memo(({ text, children }) => {
  return (
    <span className="group relative">
      <span className="pointer-events-none absolute left-1/2 -top-10 -translate-x-1/2 rounded bg-black px-2 py-1 text-white opacity-0 transition before:absolute before:top-full before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black before:content-[''] group-hover:opacity-100">
        {text}
      </span>

      {children}
    </span>
  );
});

Tooltip.displayName = 'Tooltip';

export default Tooltip;
