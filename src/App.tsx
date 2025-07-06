import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Home, About, Contact, StoryListPage, StoryDetailPage } from './pages';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import BrevoChatWidget from './components/chat/BrevoChatWidget';
import EngageKitInitializer from './components/engagekit/EngageKitInitializer';

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <AppProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="stories" element={<StoryListPage />} />
                <Route path="stories/:id" element={<StoryDetailPage />} />
                <Route path="login" element={<Login />} />
              </Route>
            </Routes>
            <BrevoChatWidget />
            <EngageKitInitializer />
          </SidebarProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;