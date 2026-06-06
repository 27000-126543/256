import { motion } from 'framer-motion';
import { ClipboardList, FileUp, AlertTriangle, User, Calendar, Clock, FileCheck, Activity } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useReportStore } from '@/store/useReportStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { id: 'queue', name: '检查队列', icon: ClipboardList, color: 'blue', path: '/technician/queue' },
  { id: 'report', name: '报告上传', icon: FileUp, color: 'green', path: '/technician/report' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function TechnicianHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getAppointmentsByTechnician } = useAppointmentStore();
  const { getReportsForReview } = useReportStore();

  const appointments = getAppointmentsByTechnician();
  const pendingReports = getReportsForReview();

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => apt.date === today);
  const pendingExams = todayAppointments.filter((apt) => apt.status === 'confirmed' || apt.status === 'urgent');
  const completedExams = appointments.filter((apt) => apt.status === 'completed' && apt.date === today);
  const urgentAppointments = appointments.filter((apt) => apt.isUrgent && apt.status !== 'completed' && apt.status !== 'cancelled');

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-teal-100 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold">{currentUser?.name || '技师'}</h1>
                <p className="text-teal-100 text-sm mt-1">{currentUser?.department || '欢迎回到医学影像检查预约平台'}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">今日统计</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="今日待检"
              value={pendingExams.length}
              icon={<Clock className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="已完成检查"
              value={completedExams.length}
              icon={<Activity className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="待审核报告"
              value={pendingReports.length}
              icon={<FileCheck className="w-6 h-6" />}
              color="yellow"
            />
          </div>
        </motion.div>

        {urgentAppointments.length > 0 && (
          <motion.div variants={itemVariants}>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800">急诊加急提醒</h3>
                  <p className="text-red-600 mt-1">当前有 <span className="font-bold text-xl">{urgentAppointments.length}</span> 个急诊加急预约需要处理</p>
                </div>
                <button
                  onClick={() => navigate('/technician/queue')}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                >
                  立即处理
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-lg">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                green: 'bg-green-50 text-green-600 hover:bg-green-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                red: 'bg-red-50 text-red-600 hover:bg-red-100',
              };
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.path)}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center gap-3"
                >
                  <div className={`p-4 rounded-xl ${colorClasses[action.color as keyof typeof colorClasses]} transition-colors`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{action.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
