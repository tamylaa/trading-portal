import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './contexts/AppContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { Home, About, Contact, StoryListPage, StoryDetailPage } from './pages';

const App = () => {
  return (
    <AppProvider>
      <SidebarProvider>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              {/* <Route path="story" element={<GuidePage />} /> */}
              <Route path="stories" element={<StoryListPage />} />
              <Route path="stories/:id" element={<StoryDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </AppProvider>
  );
};

export default App;