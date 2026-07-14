import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { Layout } from './components/layout/Layout';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PricesPage } from './pages/PricesPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { ContactsPage } from './pages/ContactsPage';
import { DocsPage } from './pages/DocsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SpecialtyPage } from './pages/SpecialtyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminDoctorEditPage } from './pages/admin/AdminDoctorEditPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';
import { AdminPromotionEditPage } from './pages/admin/AdminPromotionEditPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminDocumentsPage } from './pages/admin/AdminDocumentsPage';

function App() {
  return (
    <SiteSettingsProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="doctors" replace />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
              <Route path="doctors/new" element={<AdminDoctorEditPage />} />
              <Route path="doctors/:id" element={<AdminDoctorEditPage />} />
              <Route path="promotions" element={<AdminPromotionsPage />} />
              <Route path="promotions/new" element={<AdminPromotionEditPage />} />
              <Route path="promotions/:id" element={<AdminPromotionEditPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="documents" element={<AdminDocumentsPage />} />
            </Route>

            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="prices" element={<PricesPage />} />
              <Route path="doctors" element={<DoctorsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="docs" element={<DocsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path=":slug" element={<SpecialtyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </SiteSettingsProvider>
  );
}

export default App;
