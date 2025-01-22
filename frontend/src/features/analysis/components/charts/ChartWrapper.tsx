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

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    if (onSync) onSync(null); // Reset sync state on leave
  };

  const getChartBounds = useCallback(() => {
    if (!chartRef.current) return null;
    const container = chartRef.current.querySelector('.recharts-wrapper');
    if (!container) return null;
    return container.getBoundingClientRect();
  }, []);

  const getChartArea = useCallback(() => {
    if (!chartRef.current) return null;
    const container = chartRef.current.querySelector('.recharts-wrapper');
    if (!container) return null;
    return container.querySelector('.recharts-surface');
  }, []);

  const dispatchSyntheticEvent = useCallback((type: 'mousemove' | 'mouseleave', bounds: DOMRect) => {
    if (!isHovering || !syncState.activeIndex) return;

    const chartArea = getChartArea();
    if (!chartArea) return;

    if (type === 'mousemove') {
      const x = Math.min(Math.max(bounds.left + syncState.mouseX, bounds.left), bounds.right);
      const y = Math.min(Math.max(bounds.top + syncState.mouseY, bounds.top), bounds.bottom);

      const syntheticEvent = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        view: window,
      });
      chartArea.dispatchEvent(syntheticEvent);
    } else if (type === 'mouseleave') {
      const leaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      chartArea.dispatchEvent(leaveEvent);
    }
  }, [syncState.activeIndex, syncState.mouseX, syncState.mouseY, isHovering, getChartArea]);

  useEffect(() => {
    if (!chartRef.current || !onSync) return;
  
    const bounds = getChartBounds();
    if (!bounds) return;
  
    const hasChanged =
      lastSyncRef.current.activeIndex !== syncState.activeIndex ||
      (syncState.activeIndex !== null && (
        Math.abs(lastSyncRef.current.mouseX - syncState.mouseX) > 1 ||
        Math.abs(lastSyncRef.current.mouseY - syncState.mouseY) > 1
      ));
  
    if (!hasChanged) return;
  
    lastSyncRef.current = syncState;
  
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  
    animationFrameRef.current = requestAnimationFrame(() => {
      if (syncState.activeIndex !== null) {
        dispatchSyntheticEvent('mousemove', bounds);
      } else {
        dispatchSyntheticEvent('mouseleave', bounds);
      }
    });
  
    // Ensure all charts sync even if the mouse is not actively on this chart
    const siblingCharts = document.querySelectorAll('.chart-wrapper');
    siblingCharts.forEach((chart) => {
      if (chart !== chartRef.current) {
        const siblingBounds = chart.querySelector('.recharts-wrapper')?.getBoundingClientRect();
        if (siblingBounds && syncState.activeIndex !== null) {
          const siblingEvent = new MouseEvent('mousemove', {
            clientX: Math.min(
              Math.max(siblingBounds.left + syncState.mouseX, siblingBounds.left),
              siblingBounds.right
            ),
            clientY: Math.min(
              Math.max(siblingBounds.top + syncState.mouseY, siblingBounds.top),
              siblingBounds.bottom
            ),
            bubbles: true,
            cancelable: true,
            view: window,
          });
          const chartArea = chart.querySelector('.recharts-surface');
          chartArea?.dispatchEvent(siblingEvent);
        }
      }
    });
  
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [syncState, onSync, getChartBounds, dispatchSyntheticEvent]);
  

  return (
    <div
      ref={chartRef}
      className="chart-wrapper h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};