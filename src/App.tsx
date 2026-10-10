import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const DashboardLayout = lazy(() => import('@/pages/dashboard/DashboardLayout'));
const DashboardOverviewPage = lazy(() => import('@/pages/dashboard/DashboardOverviewPage'));
const SavedListingsPage = lazy(() => import('@/pages/dashboard/SavedListingsPage'));
const MyEnquiriesPage = lazy(() => import('@/pages/dashboard/MyEnquiriesPage'));
const MandatesPage = lazy(() => import('@/pages/dashboard/MandatesPage'));
const MandateDetailPage = lazy(() => import('@/pages/dashboard/MandateDetailPage'));
const MandateFormPage = lazy(() => import('@/pages/dashboard/MandateFormPage'));
const SubmissionsPage = lazy(() => import('@/pages/dashboard/SubmissionsPage'));
const SubmissionFormPage = lazy(() => import('@/pages/dashboard/SubmissionFormPage'));
const ProfilePage = lazy(() => import('@/pages/dashboard/ProfilePage'));

const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminSubmissionsPage = lazy(() => import('@/pages/admin/AdminSubmissionsPage'));
const AdminSubmissionReviewPage = lazy(() => import('@/pages/admin/AdminSubmissionReviewPage'));
const AdminListingsPage = lazy(() => import('@/pages/admin/AdminListingsPage'));
const AdminListingPage = lazy(() => import('@/pages/admin/AdminListingPage'));
const AdminVerificationPage = lazy(() => import('@/pages/admin/AdminVerificationPage'));
const AdminEnquiriesPage = lazy(() => import('@/pages/admin/AdminEnquiriesPage'));
const AdminMandatesPage = lazy(() => import('@/pages/admin/AdminMandatesPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'));
const AdminMetadataPage = lazy(() => import('@/pages/admin/AdminMetadataPage'));

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
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<Navigate to="/register/buyer" replace />} />
          <Route path="register/buyer" element={<RegisterPage accountType="buyer" />} />
          <Route path="register/seller" element={<RegisterPage accountType="seller" />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverviewPage />} />
            <Route path="saved" element={<SavedListingsPage />} />
            <Route path="enquiries" element={<MyEnquiriesPage />} />
            <Route path="mandates" element={<MandatesPage />} />
            <Route path="mandates/new" element={<MandateFormPage />} />
            <Route path="mandates/:id" element={<MandateDetailPage />} />
            <Route path="mandates/:id/edit" element={<MandateFormPage />} />
            <Route path="submissions" element={<SubmissionsPage />} />
            <Route path="submissions/new" element={<SubmissionFormPage />} />
            <Route path="submissions/:id" element={<SubmissionFormPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="submissions" element={<AdminSubmissionsPage />} />
            <Route path="submissions/:id" element={<AdminSubmissionReviewPage />} />
            <Route path="listings" element={<AdminListingsPage />} />
            <Route path="listings/:id" element={<AdminListingPage />} />
            <Route path="verification" element={<AdminVerificationPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="mandates" element={<AdminMandatesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
            <Route path="metadata" element={<AdminMetadataPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
