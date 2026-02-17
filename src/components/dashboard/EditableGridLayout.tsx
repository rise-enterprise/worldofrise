import { useMemo, useCallback } from 'react';
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface EditableGridLayoutProps {
  layouts: Record<string, Layout[]>;
  isEditing: boolean;
  onLayoutChange: (layout: Layout[], allLayouts: Layouts) => void;
  children: React.ReactNode;
  className?: string;
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 0 };
const COLS = { lg: 12, md: 12, sm: 12 };
const ROW_HEIGHT = 60;
const MARGIN: [number, number] = [16, 16];

export function EditableGridLayout({
  layouts,
  isEditing,
  onLayoutChange,
  children,
  className,
}: EditableGridLayoutProps) {
  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: Layouts) => {
      onLayoutChange(layout, allLayouts);
    },
    [onLayoutChange]
  );

  return (
    <div className={cn('editable-grid-layout', isEditing && 'is-editing', className)}>
      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={ROW_HEIGHT}
        margin={MARGIN}
        containerPadding={[0, 0]}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".widget-drag-handle"
        compactType="vertical"
        useCSSTransforms
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
}
