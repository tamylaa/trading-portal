import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useBrevoChat } from '../../hooks/useBrevoChat';
import { useAuth } from '../../contexts/AuthContext';

const BrevoChatLauncher = ({ websiteId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const { 
    isLoaded, 
    identifyUser, 
    trackEvent, 
    showChat 
  } = useBrevoChat(websiteId);

  // Track page views
  useEffect(() => {
    if (!isLoaded) return;

    const handleRouteChange = (url) => {
      trackEvent('page_view', {
        url,
        referrer: document.referrer
      });
    };

    // Track initial page view
    handleRouteChange(router.asPath);

    // Track subsequent route changes
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [isLoaded, router, trackEvent]);

  // Identify user when user changes
  useEffect(() => {
    if (!isLoaded || !user) return;

    identifyUser({
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      plan: user.plan || 'free',
      createdAt: user.createdAt,
      customAttributes: {
        role: user.role,
        lastLogin: new Date().toISOString()
      }
    });
  }, [isLoaded, user, identifyUser]);

  // Track important events
  const trackButtonClick = (buttonName) => {
    trackEvent('button_click', {
      button_name: buttonName,
      page: window.location.pathname
    });
  };

  return null;
};

export default BrevoChatLauncher;
