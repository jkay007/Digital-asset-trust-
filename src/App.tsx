import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ConfigWarning } from '@/components/layout/ConfigWarning';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

const MarketplacePage = lazy(() => import('@/pages/MarketplacePage'));
const AssetDetailPage = lazy(() => import('@/pages/AssetDetailPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const JurisdictionsPage = lazy(() => import('@/pages/JurisdictionsPage'));
const JurisdictionPage = lazy(() => import('@/pages/JurisdictionPage'));
const VerificationPage = lazy(() => import('@/pages/VerificationPage'));
const SellPage = lazy(() => import('@/pages/SellPage'));
const BuyersPage = lazy(() => import('@/pages/BuyersPage'));
const InsightsPage = lazy(() => import('@/pages/InsightsPage'));
const InsightPage = lazy(() => import('@/pages/InsightPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const DisclaimerPage = lazy(() => import('@/pages/legal/DisclaimerPage'));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'));

export default function App() {
  return (
    <>
      <ConfigWarning />
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="listings/:slug" element={<AssetDetailPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/:slug" element={<CategoryPage />} />
          <Route path="jurisdictions" element={<JurisdictionsPage />} />
          <Route path="jurisdictions/:slug" element={<JurisdictionPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="sell" element={<SellPage />} />
          <Route path="buyers" element={<BuyersPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="insights/:slug" element={<InsightPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="legal/disclaimer" element={<DisclaimerPage />} />
          <Route path="legal/terms" element={<TermsPage />} />
          <Route path="legal/privacy" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
