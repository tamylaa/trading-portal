import { useEffect } from 'react';
import { useBrevoChat } from '../../hooks/useBrevoChat';
import { useRouter } from 'next/router';

const ChatLauncher = ({ websiteId, user }) => {
  const router = useRouter();
  const { trackEvent, identifyUser } = useBrevoChat(websiteId);

  // Track page views
  useEffect(() => {
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
  }, [router, trackEvent]);

  // Identify user when user prop changes
  useEffect(() => {
    if (user) {
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
    }
  }, [user, identifyUser]);

  return null;
};

export default ChatLauncher;
