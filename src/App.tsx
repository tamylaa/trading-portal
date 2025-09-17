import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Home, About, Contact, StoryListPage, StoryDetailPage, EmailBlasterPage } from './pages';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ContentAccess from './pages/ContentAccess';
import Achievements from './pages/Achievements';
import UIDemoPage from './pages/UIDemoPage';
import ReactComponentsDemoPage from './pages/ReactComponentsDemoPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BrevoChatWidget from './components/chat/BrevoChatWidget';
import EngageKitInitializer from './components/engagekit/EngageKitInitializer';
import { AuthProvider } from './contexts/AuthContext';
import ReduxProvider from './store/ReduxProvider';
import { TamylaThemeProvider } from '@tamyla/ui-components-react';

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      {/* 🏪 Redux Provider - Enhanced State Management Layer */}
      <ReduxProvider>
        {/* 🎨 Tamyla Theme Provider - Essential for ui-components-react styling */}
        <TamylaThemeProvider>
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
                  <Route path="ui-demo" element={<UIDemoPage />} />
                  <Route path="react-demo" element={<ReactComponentsDemoPage />} />

                   {/* Protected Routes */}
                <Route
                  path="email-blaster"
                  element={
                    <ProtectedRoute>
                      <EmailBlasterPage />
                    </ProtectedRoute>
                  }
                />
                   <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="complete-profile"
                    element={
                      <ProtectedRoute>
                        <CompleteProfile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="content-access"
                    element={
                      <ProtectedRoute>
                        <ContentAccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="achievements"
                    element={
                      <ProtectedRoute>
                        <Achievements />
                      </ProtectedRoute>
                    }
                  />

                </Route>
              </Routes>
              <BrevoChatWidget />
              <EngageKitInitializer />
            </SidebarProvider>
          </AppProvider>
        </AuthProvider>
        </TamylaThemeProvider>
    </ReduxProvider>
  </BrowserRouter>
  );
};

export default App;