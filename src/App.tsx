import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Home, About, Contact, StoryListPage, StoryDetailPage } from './pages';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ContentUpload from './pages/ContentUpload';
import Achievements from './pages/Achievements';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BrevoChatWidget from './components/chat/BrevoChatWidget';
import EngageKitInitializer from './components/engagekit/EngageKitInitializer';
import { AuthProvider } from './contexts/AuthContext';
import ReduxProvider from './store/ReduxProvider';

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      {/* 🏪 Redux Provider - Enhanced State Management Layer */}
      <ReduxProvider>
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

                   {/* Protected Routes */}
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
                    path="content-upload"
                    element={
                      <ProtectedRoute>
                        <ContentUpload />
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
      </ReduxProvider>
    </BrowserRouter>
  );
};

export default App;