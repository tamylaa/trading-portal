import { createContext, useContext, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  useEffect(() => {
    // Load Crisp script
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    
    (function() {
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = 1;
      d.getElementsByTagName('head')[0].appendChild(s);
    })();

    // Cleanup
    return () => {
      if (window.$crisp) {
        window.$crisp.push(['do', 'session:reset']);
      }
    };
  }, []);

  const setUser = (user) => {
    if (window.$crisp && user) {
      window.$crisp.push(['set', 'user:email', [user.email]]);
      window.$crisp.push(['set', 'user:nickname', [user.name || user.email]]);
      // Add any custom user data
      window.$crisp.push(['set', 'session:data', [
        ['plan', user.plan || 'free'],
        ['signup_date', user.createdAt || new Date().toISOString()]
      ]]);
    }
  };

  const showChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:show']);
      window.$crisp.push(['do', 'chat:open']);
    }
  };

  const hideChat = () => {
    if (window.$crisp) {
      window.$crisp.push(['do', 'chat:hide']);
    }
  };

  return (
    <ChatContext.Provider value={{ setUser, showChat, hideChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
