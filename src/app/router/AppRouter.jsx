import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import AuthLayout from '../layouts/AuthLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import DocsLayout from '../layouts/DocsLayout.jsx';
import ProtectedRoute from './guards/ProtectedRoute.jsx';
import GuestRoute from './guards/GuestRoute.jsx';
import RoleRoute from './guards/RoleRoute.jsx';
import { ROLES } from '../../shared/utils/constants.js';
import { Skeleton } from '../../shared/components/ui/index.js';

const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage.jsx'));
const TwoFactorPage = lazy(() => import('../../features/auth/pages/TwoFactorPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../../features/auth/pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../../features/auth/pages/ResetPasswordPage.jsx'));
const ForbiddenPage = lazy(() => import('../../features/auth/pages/ForbiddenPage.jsx'));
const NotFoundPage = lazy(() => import('../../features/auth/pages/NotFoundPage.jsx'));
const ProfilePage = lazy(() => import('../../features/profile/pages/ProfilePage.jsx'));

const DashboardPage = lazy(() => import('../../features/dashboard/pages/DashboardPage.jsx'));
const MonitoringPage = lazy(() => import('../../features/monitoring/pages/MonitoringPage.jsx'));
const AlertPreferencesPage = lazy(
  () => import('../../features/preferences/pages/AlertPreferencesPage.jsx')
);
const TestDetectionPage = lazy(
  () => import('../../features/admin-test-detection/pages/TestDetectionPage.jsx')
);
const StudentsListPage = lazy(() => import('../../features/students/pages/StudentsListPage.jsx'));
const StudentCreatePage = lazy(() => import('../../features/students/pages/StudentCreatePage.jsx'));
const StudentDetailPage = lazy(() => import('../../features/students/pages/StudentDetailPage.jsx'));
const CoordinatorsListPage = lazy(
  () => import('../../features/coordinators/pages/CoordinatorsListPage.jsx')
);
const UniformsListPage = lazy(() => import('../../features/uniforms/pages/UniformsListPage.jsx'));
const UniformCreatePage = lazy(() => import('../../features/uniforms/pages/UniformCreatePage.jsx'));
const AlertsListPage = lazy(() => import('../../features/alerts/pages/AlertsListPage.jsx'));
const AlertDetailPage = lazy(() => import('../../features/alerts/pages/AlertDetailPage.jsx'));
const AttendanceListPage = lazy(
  () => import('../../features/attendance/pages/AttendanceListPage.jsx')
);
const StatisticsPage = lazy(() => import('../../features/statistics/pages/StatisticsPage.jsx'));
const InspectionsPage = lazy(() => import('../../features/inspections/pages/InspectionsPage.jsx'));
const AuditsPage = lazy(() => import('../../features/audits/pages/AuditsPage.jsx'));
const UniformCustomizerPage = lazy(
  () => import('../../features/models/pages/UniformCustomizerPage.jsx')
);
const CamerasListPage = lazy(() => import('../../features/cameras/pages/CamerasListPage.jsx'));
const DocsPage = lazy(() => import('../../features/docs/pages/DocsPage.jsx'));

const PageLoader = () => (
  <div className="p-6 flex flex-col gap-3">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
    <Skeleton className="h-64 w-full mt-4" />
  </div>
);

const withAuthLayout = (Page) => <AuthLayout>{Page}</AuthLayout>;
const withAdminLayout = (Page) => (
  <ProtectedRoute>
    <AdminLayout>
      <RoleRoute roles={[ROLES.ADMIN, ROLES.COORDINATOR]}>{Page}</RoleRoute>
    </AdminLayout>
  </ProtectedRoute>
);
const withAdminOnlyLayout = (Page) => (
  <ProtectedRoute>
    <AdminLayout>
      <RoleRoute roles={[ROLES.ADMIN]}>{Page}</RoleRoute>
    </AdminLayout>
  </ProtectedRoute>
);
const withProtectedLayout = (Page) => (
  <ProtectedRoute>
    <AdminLayout>{Page}</AdminLayout>
  </ProtectedRoute>
);
const withDocsLayout = (Page) => (
  <ProtectedRoute>
    <RoleRoute roles={[ROLES.ADMIN]}>
      <DocsLayout>{Page}</DocsLayout>
    </RoleRoute>
  </ProtectedRoute>
);

const AppRouter = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route
          path="/"
          element={
            <GuestRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route path="/2fa" element={withAuthLayout(<TwoFactorPage />)} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <AuthLayout>
                <ForgotPasswordPage />
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <AuthLayout>
                <ResetPasswordPage />
              </AuthLayout>
            </GuestRoute>
          }
        />
        <Route path="/unauthorized" element={withAuthLayout(<ForbiddenPage />)} />
        <Route path="/not-found" element={withAuthLayout(<NotFoundPage />)} />

        {/* RUTAS PROTEGIDAS */}
        <Route path="/dashboard" element={withProtectedLayout(<DashboardPage />)} />
        <Route path="/monitoring" element={withAdminLayout(<MonitoringPage />)} />
        <Route path="/preferences/alerts" element={withAdminLayout(<AlertPreferencesPage />)} />
        <Route path="/students" element={withAdminLayout(<StudentsListPage />)} />
        <Route path="/students/create" element={withAdminLayout(<StudentCreatePage />)} />
        <Route path="/students/:id" element={withAdminLayout(<StudentDetailPage />)} />
        <Route path="/coordinators" element={withAdminOnlyLayout(<CoordinatorsListPage />)} />
        <Route path="/uniforms" element={withAdminLayout(<UniformsListPage />)} />
        <Route path="/uniforms/create" element={withAdminLayout(<UniformCreatePage />)} />
        <Route path="/alerts" element={withAdminLayout(<AlertsListPage />)} />
        <Route path="/alerts/:idCard" element={withAdminLayout(<AlertDetailPage />)} />
        <Route path="/attendance" element={withAdminLayout(<AttendanceListPage />)} />
        <Route path="/statistics" element={withAdminLayout(<StatisticsPage />)} />
        <Route path="/inspections" element={withAdminLayout(<InspectionsPage />)} />
        <Route path="/audits" element={withAdminOnlyLayout(<AuditsPage />)} />
        <Route path="/models" element={withAdminOnlyLayout(<UniformCustomizerPage />)} />
        <Route path="/models/customizer" element={withAdminOnlyLayout(<UniformCustomizerPage />)} />
        <Route path="/cameras" element={withAdminOnlyLayout(<CamerasListPage />)} />
        <Route path="/admin/test-detection" element={withAdminOnlyLayout(<TestDetectionPage />)} />
        <Route path="/docs" element={<Navigate to="/docs/architecture" replace />} />
        <Route path="/docs/:section" element={withDocsLayout(<DocsPage />)} />
        <Route path="/profile" element={withProtectedLayout(<ProfilePage />)} />

        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
