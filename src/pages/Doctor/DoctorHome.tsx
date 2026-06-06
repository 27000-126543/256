import { motion } from 'framer-motion';
import { Calendar, FileText, AlertTriangle, ClipboardList, FileCheck, User, CalendarClock } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useReportStore } from '@/store/useReportStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const quickActions = [
  { id: 'appointments', name: '预约列表', icon: ClipboardList, color: 'blue' },
  { id: 'review', name: '报告审核', icon: FileCheck, color: 'green' },
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

export default function DoctorHome() {
  const { currentUser } = useAuthStore();
  const { getAppointmentsByDoctor } = useAppointmentStore();
  const { getReportsForReview } = useReportStore();

  const doctorAppointments = currentUser ? getAppointmentsByDoctor(currentUser.id) : [];
  const pendingReports = getReportsForReview();

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = doctorAppointments.filter((apt) => apt.date === today);
  const urgentAppointments = doctorAppointments.filter((apt) => apt.isUrgent && apt.status !== 'completed' && apt.status !== 'cancelled');

  const recentAppointments = doctorAppointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
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
                <p className="text-blue-100 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold">{currentUser?.name || '医生'}</h1>
                <p className="text-blue-100 text-sm mt-1">{currentUser?.department || '欢迎回到医学影像检查预约平台'}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">数据概览</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="今日预约数"
              value={todayAppointments.length}
              icon={<CalendarClock className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="待审核报告数"
              value={pendingReports.length}
              icon={<FileText className="w-6 h-6" />}
              color="yellow"
            />
            <StatCard
              title="急诊加急数"
              value={urgentAppointments.length}
              icon={<AlertTriangle className="w-6 h-6" />}
              color="red"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-lg">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
                green: 'bg-green-50 text-green-600 hover:bg-green-100',
                purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
                yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
              };
              return (
                <motion.button
                  key={action.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
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

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">近期预约</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无预约记录</p>
              </div>
            ) : (
              recentAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{appointment.patientName}</h3>
                        <p className="text-sm text-gray-500 mt-1">{appointment.examTypeName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(appointment.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarClock className="w-4 h-4" />
                            {appointment.timeSlot}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          院区：{appointment.branchName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {appointment.isUrgent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          急诊加急
                        </span>
                      )}
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
