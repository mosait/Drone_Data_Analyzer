// src/features/analysis/components/ChartWrapper.tsx
import { useEffect, useRef, ReactNode, useCallback, useState, useMemo } from 'react';

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
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create a memoized version of bounds to prevent unnecessary recalculations
  const getChartBounds = useCallback(() => {
    if (!chartRef.current) return null;
    const container = chartRef.current.querySelector('.recharts-wrapper');
    if (!container) return null;
    return container.getBoundingClientRect();
  }, []);

  // Memoized function to get chart area
  const getChartArea = useCallback(() => {
    if (!chartRef.current) return null;
    const container = chartRef.current.querySelector('.recharts-wrapper');
    if (!container) return null;
    return container.querySelector('.recharts-surface');
  }, []);

  // Improved synthetic event dispatch with debouncing
  const dispatchSyntheticEvent = useCallback((type: 'mousemove' | 'mouseleave', bounds: DOMRect) => {
    const chartArea = getChartArea();
    if (!chartArea) return;

    if (type === 'mousemove' && syncState.activeIndex !== null) {
      // Calculate relative position within bounds
      const x = Math.min(Math.max(bounds.left + syncState.mouseX, bounds.left), bounds.right);
      const y = Math.min(Math.max(bounds.top + syncState.mouseY, bounds.top), bounds.bottom);

      const syntheticEvent = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        view: window
      });
      chartArea.dispatchEvent(syntheticEvent);
    } else if (type === 'mouseleave') {
      const leaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      chartArea.dispatchEvent(leaveEvent);
      setIsHovering(false);
    }
  }, [syncState.activeIndex, syncState.mouseX, syncState.mouseY, getChartArea]);

  // Improved synchronization effect
  useEffect(() => {
    if (!chartRef.current || !onSync) return;

    const bounds = getChartBounds();
    if (!bounds) return;

    // Check if we have a meaningful change in state
    const hasChanged = 
      lastSyncRef.current.activeIndex !== syncState.activeIndex ||
      (syncState.activeIndex !== null && (
        Math.abs(lastSyncRef.current.mouseX - syncState.mouseX) > 1 ||
        Math.abs(lastSyncRef.current.mouseY - syncState.mouseY) > 1
      ));

    if (!hasChanged && isHovering) return;

    // Update last sync ref
    lastSyncRef.current = syncState;

    // Cancel any pending animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Clear any existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the update
    debounceTimeoutRef.current = setTimeout(() => {
      // Schedule the next update
      animationFrameRef.current = requestAnimationFrame(() => {
        if (syncState.activeIndex !== null) {
          dispatchSyntheticEvent('mousemove', bounds);
          setIsHovering(true);
        } else {
          dispatchSyntheticEvent('mouseleave', bounds);
        }
      });
    }, 16); // Roughly one frame at 60fps

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [syncState, onSync, dispatchSyntheticEvent, isHovering, getChartBounds]);

  // Handle real hover events
  useEffect(() => {
    const chartArea = getChartArea();
    if (!chartArea) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      if (onSync) {
        onSync(null);
      }
    };

    chartArea.addEventListener('mouseenter', handleMouseEnter);
    chartArea.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      chartArea.removeEventListener('mouseenter', handleMouseEnter);
      chartArea.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [getChartArea, onSync]);

  return (
    <div ref={chartRef} className="chart-wrapper h-full">
      {children}
    </div>
  );
};