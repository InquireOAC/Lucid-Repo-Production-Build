
import React, { useRef, useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // For basic web support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null) {
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 40 && !refreshing) {
        setPulling(true);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pulling) {
      setRefreshing(true);
      await Promise.resolve(onRefresh());
      setRefreshing(false);
    }
    setPulling(false);
    startY.current = null;
  };

  // Mouse (desktop) compatibility
  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.clientY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startY.current !== null) {
      const delta = e.clientY - startY.current;
      if (delta > 40 && !refreshing) {
        setPulling(true);
      }
    }
  };

  const handleMouseUp = async () => {
    if (pulling) {
      setRefreshing(true);
      await Promise.resolve(onRefresh());
      setRefreshing(false);
    }
    setPulling(false);
    startY.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ WebkitOverflowScrolling: "touch", minHeight: "100%" }}
    >
      {(pulling || refreshing) && (
        <div className="absolute top-0 left-0 w-full flex justify-center items-center z-20 pointer-events-none">
          <div className="pt-4 pb-2 animate-spin">
            <svg className="h-5 w-5 text-dream-purple" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        </div>
      )}
      <div style={{ opacity: pulling ? 0.5 : 1, transition: "opacity 0.2s" }}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
