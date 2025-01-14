// src/features/analysis/components/ChartWrapper.tsx
import { useEffect, useRef, ReactNode, useCallback, useState } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  onSync?: (state: any) => void;
  syncState: {
    activeIndex: number | null;
    mouseX: number;
    mouseY: number;
  };
}

export const ChartWrapper = ({ children, onSync, syncState }: ChartWrapperProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const lastSyncRef = useRef(syncState);
  const animationFrameRef = useRef<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Memoized function to dispatch synthetic event
  const dispatchSyntheticEvent = useCallback((chartArea: Element, bounds: DOMRect) => {
    if (syncState.activeIndex !== null) {
      const syntheticEvent = new MouseEvent('mousemove', {
        clientX: bounds.left + syncState.mouseX,
        clientY: bounds.top + syncState.mouseY,
        bubbles: true,
        cancelable: true
      });
      chartArea.dispatchEvent(syntheticEvent);
    } else {
      const leaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true
      });
      chartArea.dispatchEvent(leaveEvent);
      setIsHovering(false);
    }
  }, [syncState.activeIndex, syncState.mouseX, syncState.mouseY]);

  useEffect(() => {
    if (!chartRef.current || !onSync) return;

    const container = chartRef.current.querySelector('.recharts-wrapper');
    const chartArea = container?.querySelector('.recharts-surface');
    
    if (!container || !chartArea) return;

    // Only update if we have a meaningful change in position or state
    const hasChanged = 
      lastSyncRef.current.activeIndex !== syncState.activeIndex ||
      (syncState.activeIndex !== null && (
        Math.abs(lastSyncRef.current.mouseX - syncState.mouseX) > 1 ||
        Math.abs(lastSyncRef.current.mouseY - syncState.mouseY) > 1
      ));

    if (!hasChanged && isHovering) {
      return;
    }

    // Update last sync ref
    lastSyncRef.current = syncState;

    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule the next update
    animationFrameRef.current = requestAnimationFrame(() => {
      const bounds = container.getBoundingClientRect();
      dispatchSyntheticEvent(chartArea, bounds);
      setIsHovering(syncState.activeIndex !== null);
    });

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [syncState, onSync, dispatchSyntheticEvent, isHovering]);

  // Add event listeners to handle real hover states
  useEffect(() => {
    const chartArea = chartRef.current?.querySelector('.recharts-surface');
    if (!chartArea) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    chartArea.addEventListener('mouseenter', handleMouseEnter);
    chartArea.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      chartArea.removeEventListener('mouseenter', handleMouseEnter);
      chartArea.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={chartRef} className="chart-wrapper h-full">
      {children}
    </div>
  );
};