import React, { useState, useRef, useEffect } from 'react';
import './style.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>(position);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Adjust tooltip position if it goes off-screen
  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedPosition = position;

      // Check if tooltip goes off the right edge
      if (tooltipRect.right > viewportWidth && position === 'right') {
        adjustedPosition = 'left';
      }

      // Check if tooltip goes off the left edge
      if (tooltipRect.left < 0 && position === 'left') {
        adjustedPosition = 'right';
      }

      // Check if tooltip goes off the top
      if (tooltipRect.top < 0 && position === 'top') {
        adjustedPosition = 'bottom';
      }

      // Check if tooltip goes off the bottom
      if (tooltipRect.bottom > viewportHeight && position === 'bottom') {
        adjustedPosition = 'top';
      }

      setTooltipPosition(adjustedPosition);
    } else {
      setTooltipPosition(position);
    }
  }, [isVisible, position]);

  return (
    <div
      className={`tooltip-container ${className}`}
      ref={triggerRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${tooltipPosition}`}
          role="tooltip"
        >
          {content}
          <div className={`tooltip-arrow tooltip-arrow-${tooltipPosition}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
