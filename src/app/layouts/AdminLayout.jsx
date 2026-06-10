import { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../../shared/components/layout/Sidebar.jsx';
import Topbar from '../../shared/components/layout/Topbar.jsx';
import ConstellationBackground from '../../shared/components/feedback/ConstellationBackground.jsx';
import { useDetectionAlerts } from '../../features/monitoring/hooks/useDetectionAlerts.js';
import { useLiveDetections } from '../../features/monitoring/hooks/useLiveDetections.js';
import { useNotifications } from '../../features/notifications/hooks/useNotifications.js';

const AdminLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  useDetectionAlerts();
  useLiveDetections();
  useNotifications();

  return (
    <div className="flex min-h-screen bg-background text-on-surface overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[280px]">
        <Topbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 relative animate-fade-in">
          <ConstellationBackground seed={42} maxDistance={130} className="opacity-40" />
          <div
            className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container/10 blur-[120px] pointer-events-none -z-0"
            aria-hidden
          />
          <div
            className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-surface-bright/20 blur-[100px] pointer-events-none -z-0"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col gap-6 max-w-7xl mx-auto">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
