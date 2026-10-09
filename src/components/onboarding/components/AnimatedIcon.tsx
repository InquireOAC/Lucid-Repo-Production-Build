import { useEffect, useRef } from "react";

export type DrawIconName = "moon" | "brain" | "eye" | "globe" | "mic" | "pen" | "sparkles" | "tag";

const paths: Record<DrawIconName, JSX.Element> = {
  moon: <path d="M30 8a18 18 0 1 0 10 32A14 14 0 0 1 30 8Z" className="icon-path" />,
  brain: (
    <g>
      <path d="M18 14a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V14Z" className="icon-path" />
      <path d="M30 8a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6" className="icon-path" />
      <path d="M14 22h4M30 22h4" className="icon-path" />
    </g>
  ),
  eye: (
    <g>
      <path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24Z" className="icon-path" />
      <circle cx="24" cy="24" r="6" className="icon-path" />
    </g>
  ),
  globe: (
    <g>
      <circle cx="24" cy="24" r="18" className="icon-path" />
      <ellipse cx="24" cy="24" rx="8" ry="18" className="icon-path" />
      <path d="M6 24h36" className="icon-path" />
    </g>
  ),
  mic: (
    <g>
      <rect x="18" y="6" width="12" height="22" rx="6" className="icon-path" />
      <path d="M10 24a14 14 0 0 0 28 0" className="icon-path" />
      <path d="M24 38v6" className="icon-path" />
    </g>
  ),
  pen: (
    <g>
      <path d="M8 40l6-2 22-22-4-4-22 22-2 6Z" className="icon-path" />
      <path d="M30 14l4 4" className="icon-path" />
    </g>
  ),
  sparkles: (
    <g>
      <path d="M24 6l3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z" className="icon-path" />
      <path d="M38 32l1.5 4.5L44 38l-4.5 1.5L38 44l-1.5-4.5L32 38l4.5-1.5L38 32Z" className="icon-path" />
    </g>
  ),
  tag: (
    <g>
      <path d="M6 6h18l18 18-18 18L6 24V6Z" className="icon-path" />
      <circle cx="14" cy="14" r="2.5" className="icon-path" />
    </g>
  ),
};

interface AnimatedIconProps {
  icon: DrawIconName;
  delay?: number;
  className?: string;
}

const AnimatedIcon = ({ icon, delay = 0, className = "" }: AnimatedIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!ref.current) return;
      ref.current.querySelectorAll<SVGGeometryElement>(".icon-path").forEach((el, i) => {
        const length = typeof el.getTotalLength === "function" ? el.getTotalLength() : 260;
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = `${length}`;
        el.style.animation = `onb-draw-icon 1.1s ${i * 0.18}s ease-out forwards`;
      });
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div ref={ref} className={`w-11 h-11 text-primary ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
    </div>
  );
};

export default AnimatedIcon;