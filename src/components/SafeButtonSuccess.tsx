import React, { useRef, useEffect } from 'react';
import { ButtonSuccess } from '@tamyla/ui-components-react';

interface SafeButtonSuccessProps {
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

/**
 * Safe wrapper for ButtonSuccess to prevent duplicate rendering
 * Ensures component only renders once even with StrictMode
 */
const SafeButtonSuccess: React.FC<SafeButtonSuccessProps> = (props) => {
  const hasRendered = useRef(false);
  const [shouldRender, setShouldRender] = React.useState(false);

  useEffect(() => {
    // Only allow rendering once
    if (!hasRendered.current) {
      hasRendered.current = true;
      setShouldRender(true);
    }
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('SafeButtonSuccess effect run, shouldRender:', shouldRender);
  }, [shouldRender]);

  if (!shouldRender) {
    return <div className={props.className} style={{ opacity: 0 }}>Loading...</div>;
  }

  return <ButtonSuccess {...props} />;
};

export default SafeButtonSuccess;
