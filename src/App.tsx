import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Home, About, Contact, StoryListPage, StoryDetailPage } from './pages';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';

const App = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <SidebarProvider>
          <BrowserRouter basename={process.env.PUBLIC_URL}>
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
          </BrowserRouter>
        </SidebarProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;