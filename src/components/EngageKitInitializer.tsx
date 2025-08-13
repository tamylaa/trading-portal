import { useEffect } from 'react';

interface EngageKitConfig {
  modules?: {
    highlighter?: {
      enabled?: boolean;
      highlightColor?: string;
    };
    readingProgress?: {
      enabled?: boolean;
      height?: string;
      color?: string;
    };
  };
}

interface EngageKitInitializerProps {
  config?: EngageKitConfig;
}

const defaultConfig: EngageKitConfig = {
  modules: {
    highlighter: {
      enabled: true,
      highlightColor: '#ffeb3b'
    },
    readingProgress: {
      enabled: true,
      color: '#4CAF50',
      height: '4px'
    }
  }
};

export const EngageKitInitializer: React.FC<EngageKitInitializerProps> = ({ 
  config = defaultConfig 
}) => {
  useEffect(() => {
    // @ts-ignore - EngageKit is available globally
    const ek = new window.EngageKit(config);
    
    return () => {
      // Cleanup if needed
      if (ek && typeof ek.destroy === 'function') {
        ek.destroy();
      }
    };
  }, [config]);

  return null;
};

export default EngageKitInitializer;