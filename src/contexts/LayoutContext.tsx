import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

// ===== VIEWPORT CONTEXT =====
// Academic Approach: Context-based viewport inheritance

interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ViewportContext = createContext<ViewportState | null>(null);

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState<ViewportState>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    breakpoint: 'lg'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Academic breakpoint system
      const getBreakpoint = (w: number): ViewportState['breakpoint'] => {
        if (w < 480) return 'xs';
        if (w < 640) return 'sm';
        if (w < 768) return 'md';
        if (w < 1024) return 'lg';
        if (w < 1280) return 'xl';
        return '2xl';
      };

      setViewport({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: height > width ? 'portrait' : 'landscape',
        breakpoint: getBreakpoint(width)
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Memoize the viewport context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => viewport, [viewport]);

  return (
    <ViewportContext.Provider value={contextValue}>
      {children}
    </ViewportContext.Provider>
  );
};

export const useViewport = (): ViewportState => {
  const context = useContext(ViewportContext);
  if (!context) {
    throw new Error('useViewport must be used within ViewportProvider');
  }
  return context;
};

// ===== LAYOUT CONTEXT =====
// Academic Approach: Hierarchical layout inheritance

interface LayoutConfig {
  // Spacing inheritance
  spacing: {
    container: string;
    section: string;
    component: string;
  };

  // Grid inheritance
  grid: {
    columns: number;
    gap: string;
    maxWidth: string;
  };

  // Typography scale inheritance
  typography: {
    scale: number; // 1.2 for major third, 1.25 for perfect fourth
  };

  // Color inheritance (light/dark mode)
  theme: 'light' | 'dark' | 'auto';

  // Layout constraints
  constraints: {
    maxWidth: string;
    minWidth: string;
    contentWidth: string;
  };
}

const LayoutContext = createContext<LayoutConfig | null>(null);

interface LayoutProviderProps {
  children: React.ReactNode;
  config?: Partial<LayoutConfig>;
}

// Academic default layout configuration - moved outside component for useMemo optimization
const defaultConfig: LayoutConfig = {
  spacing: {
    container: 'var(--spacing-container)',
    section: 'var(--spacing-section)',
    component: 'var(--spacing-component-md)'
  },
  grid: {
    columns: 12,
    gap: 'var(--spacing-grid-gap-md)',
    maxWidth: 'var(--container-xl)'
  },
  typography: {
    scale: 1.2 // Major third scale
  },
  theme: 'auto',
  constraints: {
    maxWidth: 'var(--container-2xl)',
    minWidth: '320px',
    contentWidth: 'var(--container-lg)'
  }
};

export const LayoutProvider: React.FC<LayoutProviderProps> = ({
  children,
  config = {}
}) => {

  // Memoize the layout configuration to prevent unnecessary re-renders
  const layoutConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);

  return (
    <LayoutContext.Provider value={layoutConfig}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = (): LayoutConfig => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};

// ===== COMPOSITION UTILITIES =====
// Academic Approach: Functional layout composition

export const composeLayout = (
  baseConfig: Partial<LayoutConfig>,
  overrides: Partial<LayoutConfig>
): LayoutConfig => {
  // Deep merge with academic precision
  return {
    spacing: { ...baseConfig.spacing, ...overrides.spacing },
    grid: { ...baseConfig.grid, ...overrides.grid },
    typography: { ...baseConfig.typography, ...overrides.typography },
    theme: overrides.theme || baseConfig.theme || 'auto',
    constraints: { ...baseConfig.constraints, ...overrides.constraints }
  } as LayoutConfig;
};

// ===== RESPONSIVE UTILITY =====
// Academic Approach: Declarative responsive behavior

interface ResponsiveConfig<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

export const useResponsive = <T,>(
  config: ResponsiveConfig<T>,
  defaultValue: T
): T => {
  const { breakpoint } = useViewport();

  // Academic responsive resolution
  const breakpointOrder: (keyof ResponsiveConfig<T>)[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // Find the most specific matching value
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (config[bp] !== undefined) {
      return config[bp]!;
    }
  }

  return defaultValue;
};

// ===== LAYOUT PRIMITIVES =====
// Academic Approach: Atomic layout components

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  center = false,
  className = '',
  children,
  ...props
}) => {
  const layout = useLayout();

  const maxWidthClass = size === 'full' ? 'w-full' : `max-w-${size}`;
  const centerClass = center ? 'mx-auto' : '';

  return (
    <div
      className={`container ${maxWidthClass} ${centerClass} ${className}`.trim()}
      style={{
        paddingLeft: layout.spacing.container,
        paddingRight: layout.spacing.container,
        maxWidth: size === 'full' ? '100%' : `var(--container-${size})`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  spacing = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <section
      className={`section ${className}`.trim()}
      style={{
        paddingTop: `var(--spacing-${spacing})`,
        paddingBottom: `var(--spacing-${spacing})`
      }}
      {...props}
    >
      {children}
    </section>
  );
};

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: ResponsiveConfig<number>;
  gap?: string;
}

export const Grid: React.FC<GridProps> = ({
  columns = { xs: 1, md: 2, lg: 3 },
  gap,
  className = '',
  children,
  ...props
}) => {
  const responsiveColumns = useResponsive(columns, 1);

  return (
    <div
      className={`grid ${className}`.trim()}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap: gap || 'var(--layout-grid-gap-md)'
      }}
      {...props}
    >
      {children}
    </div>
  );
};
