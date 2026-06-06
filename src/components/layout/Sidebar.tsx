import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Calendar,
  FileText,
  Star,
  Users,
  Activity,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Upload,
  Monitor,
  Sliders,
  Trophy,
  PieChart,
  FileBarChart,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';

const patientMenu = [
  { path: '/patient', icon: Home, label: '首页' },
  { path: '/patient/appointment', icon: Calendar, label: '预约检查' },
  { path: '/patient/appointments', icon: ClipboardList, label: '我的预约' },
  { path: '/patient/reports', icon: FileText, label: '报告中心' },
  { path: '/patient/evaluate', icon: Star, label: '满意度评价' },
];

const doctorMenu = [
  { path: '/doctor', icon: Home, label: '首页' },
  { path: '/doctor/appointments', icon: ClipboardList, label: '预约列表' },
  { path: '/doctor/reports', icon: FileText, label: '报告审核' },
];

const technicianMenu = [
  { path: '/technician', icon: Home, label: '首页' },
  { path: '/technician/queue', icon: Users, label: '检查队列' },
  { path: '/technician/reports', icon: Upload, label: '报告上传' },
];

const directorMenu = [
  { path: '/director', icon: Home, label: '首页' },
  { path: '/director/devices', icon: Monitor, label: '设备监控' },
  { path: '/director/capacity', icon: Sliders, label: '容量设置' },
  { path: '/director/satisfaction', icon: Trophy, label: '满意度排名' },
];

const adminMenu = [
  { path: '/admin', icon: Home, label: '首页' },
  { path: '/admin/overview', icon: BarChart3, label: '全局概览' },
  { path: '/admin/reports', icon: FileBarChart, label: '运营报告' },
  { path: '/admin/distribution', icon: PieChart, label: '收入分布' },
];

const menuMap: Record<string, typeof patientMenu> = {
  patient: patientMenu,
  doctor: doctorMenu,
  technician: technicianMenu,
  director: directorMenu,
  admin: adminMenu,
};

const roleNames: Record<string, string> = {
  patient: '患者',
  doctor: '开单医生',
  technician: '检查技师',
  director: '科室主任',
  admin: '院领导',
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const menuItems = currentUser ? menuMap[currentUser.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">医技预约平台</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {!collapsed && currentUser && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{roleNames[currentUser.role]}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path.endsWith('/' + currentUser?.role)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-gray-100">
        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full',
              isActive
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )
          }
        >
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>通知中心</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>退出登录</span>}
        </button>
      </div>
    </div>
  );
}
