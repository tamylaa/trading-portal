import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
// Import only critical pages directly (avoiding barrel export that includes heavy dependencies)
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import Dashboard from './pages/Dashboard';
import CompleteProfile from './pages/CompleteProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BrevoChatWidget from './components/chat/BrevoChatWidget';
import EngageKitInitializer from './components/engagekit/EngageKitInitializer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ReduxProvider from './store/ReduxProvider';
import { TamylaThemeProvider } from '@tamyla/ui-components-react';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { ContentAccess } from '@tamyla/content-hub';

// ContentAccess wrapper to provide auth props
const ContentAccessWrapper = () => {
  const { currentUser, token } = useAuth();
  return (
    // @ts-ignore - ContentAccess props are defined in the component
    <ContentAccess
      authToken={token}
      currentUser={currentUser}
      apiBase="https://content.tamyla.com"
      enableDebugLogging={process.env.NODE_ENV === 'development'}
      onFileViewed={(result) => console.log('File viewed:', result)}
      onFileDownloaded={(result) => console.log('File downloaded:', result)}
      onSearchPerformed={(query, count) => console.log('Search performed:', query, count)}
      onError={(error) => console.error('ContentAccess error:', error)}
    />
  );
};

// Lazy load heavy pages with PDF functionality and syntax highlighting
const StoryListPage = React.lazy(() => import('./pages/StoryListPage'));
const StoryDetailPage = React.lazy(() => import('./pages/StoryDetailPage'));
const EmailBlasterPage = React.lazy(() => import('./pages/EmailBlasterPage'));
// const ContentAccess = React.lazy(() => import('@tamyla/content-hub').then(module => ({ default: module.ContentAccess })));

// Temporary direct import for testing
const Achievements = React.lazy(() => import('./pages/Achievements'));
const UIDemoPage = React.lazy(() => import('./pages/UIDemoPage'));
const ReactComponentsDemoPage = React.lazy(() => import('./pages/ReactComponentsDemoPage'));
// GuidePage removed as it's not used in routes

const App = () => {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      {/* 🏪 Redux Provider - Enhanced State Management Layer */}
      <ReduxProvider>
        {/* 🎨 Tamyla Theme Provider - Essential for ui-components-react styling */}
        <TamylaThemeProvider>
          {/* 📐 Layout Inheritance System - Academic Approach */}
          {/* <ViewportProvider>
            <LayoutProvider> */}
              <FeatureFlagProvider>
                <AuthProvider>
                  <AppProvider>
                    <SidebarProvider>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="stories" element={
                    <Suspense fallback={<div>Loading stories...</div>}>
                      <StoryListPage />
                    </Suspense>
                  } />
                  <Route path="stories/:id" element={
                    <Suspense fallback={<div>Loading story...</div>}>
                      <StoryDetailPage />
                    </Suspense>
                  } />
                  <Route path="login" element={<Login />} />
                  <Route path="ui-demo" element={
                    <Suspense fallback={<div>Loading UI demo...</div>}>
                      <UIDemoPage />
                    </Suspense>
                  } />
                  <Route path="react-demo" element={
                    <Suspense fallback={<div>Loading React demo...</div>}>
                      <ReactComponentsDemoPage />
                    </Suspense>
                  } />

                   {/* Protected Routes */}
                <Route
                  path="email-blaster"
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div>Loading email blaster...</div>}>
                        <EmailBlasterPage />
                      </Suspense>
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
                        <ContentAccessWrapper />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="achievements"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<div>Loading achievements...</div>}>
                          <Achievements />
                        </Suspense>
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
        </FeatureFlagProvider>
        {/* </LayoutProvider>
      </ViewportProvider> */}
        </TamylaThemeProvider>
    </ReduxProvider>
  </BrowserRouter>
  );
};

export default App;