// src/components/chat/BrevoChatWidget.js
import { useEffect } from 'react';

const BrevoChatWidget = () => {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    // Prevent duplicate script injection
    if (window.BrevoConversations) return;

    const script = document.createElement('script');
    script.innerHTML = `
      (function(d, w, c) {
        w.BrevoConversationsID = '6704cb001ad80008190eeb95';
        w[c] = w[c] || function() {
            (w[c].q = w[c].q || []).push(arguments);
        };
      })(document, window, 'BrevoConversations');
    `;
    
    document.head.appendChild(script);

    // Load the main script
    const scriptSrc = document.createElement('script');
    scriptSrc.async = true;
    scriptSrc.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
    document.head.appendChild(scriptSrc);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      if (scriptSrc.parentNode) {
        document.head.removeChild(scriptSrc);
      }
      delete window.BrevoConversations;
    };
  }, []);

  return null;
};

export default BrevoChatWidget;