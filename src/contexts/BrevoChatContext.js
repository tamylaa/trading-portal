import { createContext, useContext, useEffect, useCallback } from 'react';

const BrevoChatContext = createContext();

export const BrevoChatProvider = ({ children }) => {
  const loadBrevoChat = useCallback((websiteId) => {
    if (typeof window === 'undefined' || !websiteId) return;

    // Prevent duplicate script loading
    if (window.brevo) return;

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.id = 'brevo-chat-widget';
    script.src = `https://widget.brevo.com/ws/${websiteId}.js`;
    
    // Add script to document
    document.body.appendChild(script);

    // Initialize Brevo chat
    window.brevo = {
      websiteId: websiteId,
      chatOptions: {
        email: '',
        givenName: '',
        surname: '',
        phone: '',
        company: ''
      },
      onLoad: function() {
        console.log('Brevo chat loaded');
      }
    };

    // Cleanup function
    return () => {
      const scriptElement = document.getElementById('brevo-chat-widget');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
      delete window.brevo;
    };
  }, []);

  const updateUser = useCallback((userData) => {
    if (typeof window === 'undefined' || !window.brevo) return;

    // Update user information in chat
    window.brevo.chatOptions = {
      ...window.brevo.chatOptions,
      email: userData.email || '',
      givenName: userData.firstName || userData.name || '',
      surname: userData.lastName || '',
      phone: userData.phone || '',
      company: userData.company || ''
    };
  }, []);

  const openChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.brevo) {
      window.brevo.openChat();
    }
  }, []);

  const closeChat = useCallback(() => {
    if (typeof window !== 'undefined' && window.brevo) {
      window.brevo.closeChat();
    }
  }, []);

  return (
    <BrevoChatContext.Provider value={{ loadBrevoChat, updateUser, openChat, closeChat }}>
      {children}
    </BrevoChatContext.Provider>
  );
};

export const useBrevoChat = () => {
  const context = useContext(BrevoChatContext);
  if (!context) {
    throw new Error('useBrevoChat must be used within a BrevoChatProvider');
  }
  return context;
};
