import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '../../store/useAuthStore';

export default function MainLayout() {
  const { isAuthenticated, currentUser } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roleRedirects: Record<string, string> = {
    patient: '/patient',
    doctor: '/doctor',
    technician: '/technician',
    director: '/director',
    admin: '/admin',
  };

  if (location.pathname === '/' && currentUser) {
    return <Navigate to={roleRedirects[currentUser.role] || '/login'} replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
