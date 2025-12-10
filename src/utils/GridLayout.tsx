import React, { useState, useCallback, useMemo } from "react";
import {
  ResponsiveGridLayout,
  useContainerWidth,
  verticalCompactor,
  horizontalCompactor,
  noCompactor,
  type Layout,
  type ResponsiveLayouts,
} from "react-grid-layout";

export interface GridLayoutProps {
  /** Single layout items array - applied to largest breakpoint, library generates others */
  /** Breakpoint-specific layouts - library will generate missing breakpoints automatically */
  layouts?: ResponsiveLayouts<string>;
  children: React.ReactNode[];
  onLayoutChange?: (
    layout: Layout,
    allLayouts: ResponsiveLayouts<string>
  ) => void;
  className?: string;
  rowHeight?: number;
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  breakpoints?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  compactType?: "vertical" | "horizontal" | null;
  preventCollision?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  margin?: [number, number];
  containerPadding?: [number, number];
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  layouts,
  children,
  onLayoutChange,
  className = "",
  rowHeight = 30,
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  compactType = "vertical",
  // preventCollision is handled by the compactor in v2, keeping in interface for API compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preventCollision,
  isDraggable = true,
  isResizable = true,
  margin = [10, 10],
  containerPadding = [10, 10],
}) => {
  const { width, containerRef, mounted } = useContainerWidth();

  // Convert items to layouts format if provided, otherwise use layouts directly
  // The library will automatically generate missing breakpoints
  const initialLayouts = useMemo<ResponsiveLayouts<string>>(() => {
    if (layouts) {
      return layouts;
    }
    
    return {};
  }, [layouts]);

  const [currentLayouts, setCurrentLayouts] =
    useState<ResponsiveLayouts<string>>(initialLayouts);

  const handleLayoutChange = useCallback(
    (layout: Layout, allLayouts: ResponsiveLayouts<string>) => {
      setCurrentLayouts(allLayouts);
      if (onLayoutChange) {
        onLayoutChange(layout, allLayouts);
      }
    },
    [onLayoutChange]
  );

  // Determine compactor based on compactType
  const compactor = useMemo(() => {
    if (compactType === null) return noCompactor;
    if (compactType === "vertical") return verticalCompactor;
    if (compactType === "horizontal") return horizontalCompactor;
    return verticalCompactor;
  }, [compactType]);

  if (!mounted) {
    return <div ref={containerRef} className={`grid-layout ${className}`} />;
  }

  return (
    <div ref={containerRef} className={`grid-layout ${className}`}>
      <ResponsiveGridLayout
        width={width}
        layouts={layouts || currentLayouts}
        onLayoutChange={handleLayoutChange}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        margin={margin}
        containerPadding={containerPadding}
        dragConfig={{
          enabled: isDraggable,
          handle: ".drag-handle",
        }}
        resizeConfig={{
          enabled: isResizable,
        }}
        compactor={compactor}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
};
