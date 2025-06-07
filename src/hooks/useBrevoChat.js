// src/hooks/useBrevoChat.js
import { useCallback, useState, useEffect } from 'react';

export const useBrevoChat = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Track custom events
  const trackEvent = useCallback((eventName, eventData = {}) => {
    if (typeof window === 'undefined' || !window.BrevoConversations) return;
    
    window.BrevoConversations('trackEvent', eventName, {
      ...eventData,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    });
  }, []);

  // Identify user
  const identifyUser = useCallback((userData) => {
    if (typeof window === 'undefined' || !window.BrevoConversations || !userData) return;

    window.BrevoConversations('setUser', {
      email: userData.email,
      name: userData.name || userData.email,
      plan: userData.plan || 'free',
      userId: userData.id,
      signupDate: userData.createdAt || new Date().toISOString(),
      ...(userData.customAttributes || {})
    });
  }, []);

  // Show/hide chat
  const showChat = useCallback(() => {
    if (typeof window === 'undefined' || !window.BrevoConversations) return;
    window.BrevoConversations('show');
  }, []);

  const hideChat = useCallback(() => {
    if (typeof window === 'undefined' || !window.BrevoConversations) return;
    window.BrevoConversations('hide');
  }, []);

  // Set business hours (9 AM - 6 PM, Monday to Friday)
  const setBusinessHours = useCallback(() => {
    if (typeof window === 'undefined' || !window.BrevoConversations) return;
    
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    window.BrevoConversations('setAvailability', isBusinessHours ? 'available' : 'unavailable');
    
    return isBusinessHours;
  }, []);

  // Set up event listeners when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleChatOpened = () => {
      setIsChatOpen(true);
      trackEvent('chat_opened');
    };

    const handleChatClosed = () => {
      setIsChatOpen(false);
      trackEvent('chat_closed');
    };

    // Check if Brevo is already loaded
    if (window.BrevoConversations) {
      window.BrevoConversations('on', 'chat:opened', handleChatOpened);
      window.BrevoConversations('on', 'chat:closed', handleChatClosed);
      setIsLoaded(true);
    }

    // Set up business hours check every minute
    const businessHoursInterval = setInterval(setBusinessHours, 60000);
    setBusinessHours(); // Initial check

    return () => {
      clearInterval(businessHoursInterval);
      if (window.BrevoConversations) {
        window.BrevoConversations('off', 'chat:opened', handleChatOpened);
        window.BrevoConversations('off', 'chat:closed', handleChatClosed);
      }
    };
  }, [setBusinessHours, trackEvent]);

  return {
    isLoaded,
    isChatOpen,
    identifyUser,
    trackEvent,
    showChat,
    hideChat,
    setBusinessHours
  };
};