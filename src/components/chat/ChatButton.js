import { useEffect, useState } from 'react';
import { useBrevoChat } from '../../hooks/useBrevoChat';
import { useAuth } from '../../contexts/AuthContext';

// Load Brevo script if not already loaded
const loadBrevoScript = () => {
  if (typeof window !== 'undefined' && !window.BrevoConversations) {
    const script = document.createElement('script');
    script.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
    script.async = true;
    script.onload = () => {
      if (window.BrevoConversations) {
        window.BrevoConversations('init', {
          websiteId: process.env.REACT_APP_BREVO_WEBSITE_ID,
          theme: {
            primaryColor: '#000000',
            secondaryColor: '#ffffff'
          }
        });
      }
    };
    script.onerror = (error) => {
      console.error('Failed to load Brevo chat widget:', error);
    };
    document.body.appendChild(script);
  }
};

const ChatButton = ({ websiteId }) => {
  // Load Brevo script when component mounts
  useEffect(() => {
    loadBrevoScript();
  }, []);
  const { user } = useAuth();
  const { isLoaded, isChatOpen, showChat, identifyUser } = useBrevoChat(websiteId);
  const [isVisible, setIsVisible] = useState(false);

  // Identify user when loaded and user is available
  useEffect(() => {
    if (isLoaded && user) {
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
  }, [isLoaded, user, identifyUser]);

  // Show button with delay for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded || !isVisible) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 transition-all duration-300 transform ${
        isChatOpen ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      <button
        onClick={showChat}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center justify-center"
        aria-label="Chat with support"
        style={{
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.4)'
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatButton;
