
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
  const [pullDistance, setPullDistance] = useState(0);

  const PULL_THRESHOLD = 80; // Minimum distance to trigger refresh
  const MAX_PULL_DISTANCE = 120; // Maximum pull distance for visual feedback

  // For touch devices (mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only start tracking if we're at the very top of the container
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPullDistance(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null && containerRef.current) {
      // Only proceed if we're still at the top
      if (containerRef.current.scrollTop > 0) {
        startY.current = null;
        setPullDistance(0);
        setPulling(false);
        return;
      }

      const currentY = e.touches[0].clientY;
      const delta = currentY - startY.current;
      
      // Only track downward movement (positive delta)
      if (delta > 0) {
        // Prevent default scrolling behavior when pulling down from top
        e.preventDefault();
        
        const distance = Math.min(delta, MAX_PULL_DISTANCE);
        setPullDistance(distance);
        
        if (distance > PULL_THRESHOLD && !refreshing) {
          setPulling(true);
        } else {
          setPulling(false);
        }
      }
    }
  };

  const handleTouchEnd = async () => {
    if (startY.current !== null) {
      if (pullDistance > PULL_THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPulling(false);
        await Promise.resolve(onRefresh());
        setRefreshing(false);
      } else {
        setPulling(false);
      }
      
      startY.current = null;
      setPullDistance(0);
    }
  };

  // Mouse events for desktop (optional - less common use case)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.clientY;
      setPullDistance(0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startY.current !== null && containerRef.current) {
      if (containerRef.current.scrollTop > 0) {
        startY.current = null;
        setPullDistance(0);
        setPulling(false);
        return;
      }

      const delta = e.clientY - startY.current;
      if (delta > 0) {
        const distance = Math.min(delta, MAX_PULL_DISTANCE);
        setPullDistance(distance);
        
        if (distance > PULL_THRESHOLD && !refreshing) {
          setPulling(true);
        } else {
          setPulling(false);
        }
      }
    }
  };

  const handleMouseUp = async () => {
    if (startY.current !== null) {
      if (pullDistance > PULL_THRESHOLD && !refreshing) {
        setRefreshing(true);
        setPulling(false);
        await Promise.resolve(onRefresh());
        setRefreshing(false);
      } else {
        setPulling(false);
      }
      
      startY.current = null;
      setPullDistance(0);
    }
  };

  // Reset pull state when scrolling starts normally
  const handleScroll = () => {
    if (containerRef.current && containerRef.current.scrollTop > 0) {
      startY.current = null;
      setPullDistance(0);
      setPulling(false);
    }
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
      onScroll={handleScroll}
      style={{ 
        WebkitOverflowScrolling: "touch", 
        minHeight: "100%",
        transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.5, 40)}px)` : 'none',
        transition: startY.current === null ? 'transform 0.2s ease-out' : 'none'
      }}
    >
      {(pulling || refreshing) && (
        <div 
          className="absolute top-0 left-0 w-full flex justify-center items-center z-20 pointer-events-none"
          style={{ 
            transform: `translateY(-${Math.max(60 - pullDistance, 0)}px)`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1)
          }}
        >
          <div className="pt-4 pb-2">
            {refreshing ? (
              <div className="animate-spin">
                <svg className="h-5 w-5 text-dream-purple" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            ) : pulling ? (
              <div className="text-dream-purple text-sm font-medium">Release to refresh</div>
            ) : (
              <div className="text-gray-400 text-sm">Pull down to refresh</div>
            )}
          </div>
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
