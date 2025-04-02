import React, { useRef, CSSProperties, ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Function to render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Estimated height of each item in pixels */
  estimatedItemHeight?: number;
  /** Parent container height (default 100%) */
  height?: string | number;
  /** Optional header content */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
  /** Overscan count - number of items to render outside of view */
  overscan?: number;
  /** Optional class for container */
  className?: string;
  /** Function to get unique key for each item */
  getItemKey?: (index: number, item: T) => string | number;
  /** Whether to smooth scroll */
  smooth?: boolean;
  /** Optional ref forwarding */
  scrollElementRef?: React.RefObject<HTMLDivElement>;
  /** Optional scroll offset */
  initialScrollOffset?: number;
  /** Optional ID for testing */
  'data-testid'?: string;
}

/**
 * A virtualized list component that efficiently renders large lists
 * by only rendering items that are visible in the viewport
 */
export function VirtualList<T>({
  items,
  renderItem,
  estimatedItemHeight = 40,
  height = '100%',
  header,
  footer,
  overscan = 5,
  className = '',
  getItemKey,
  smooth = true,
  scrollElementRef: externalScrollElementRef,
  initialScrollOffset,
  'data-testid': testId,
}: VirtualListProps<T>) {
  // Create ref for the scrollable element if not provided externally
  const internalScrollElementRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = externalScrollElementRef || internalScrollElementRef;

  // Set up virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => estimatedItemHeight,
    overscan,
    getItemKey: getItemKey 
      ? (index) => getItemKey(index, items[index])
      : undefined,
    initialScrollOffset,
  });

  // Calculate total list height
  const totalHeight = virtualizer.getTotalSize();

  // Prepare container style
  const containerStyle: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    overflow: 'auto',
    position: 'relative',
    scrollBehavior: smooth ? 'smooth' : 'auto',
  };

  // Prepare virtual list style
  const virtualListStyle: CSSProperties = {
    height: `${totalHeight}px`,
    width: '100%',
    position: 'relative',
  };

  // Scroll to specific index
  const scrollToIndex = (index: number, options?: { align?: 'start' | 'center' | 'end' }) => {
    virtualizer.scrollToIndex(index, options);
  };

  // Scroll to top
  const scrollToTop = () => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = totalHeight;
    }
  };

  return (
    <div 
      ref={scrollElementRef}
      style={containerStyle}
      className={className}
      data-testid={testId}
    >
      {/* Header content if provided */}
      {header && <div className="sticky top-0 z-10">{header}</div>}
      
      {/* Virtualized list items */}
      <div style={virtualListStyle}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            data-index={virtualItem.index}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
      
      {/* Footer content if provided */}
      {footer && (
        <div className="sticky bottom-0 z-10 mt-2">
          {footer}
        </div>
      )}
    </div>
  );
}

// Add static methods to component for external usage
VirtualList.displayName = 'VirtualList';

// Example usage:
// <VirtualList 
//   items={clients}
//   renderItem={(client) => <ClientListItem client={client} />}
//   estimatedItemHeight={60}
//   header={<ClientListHeader />}
// /> 