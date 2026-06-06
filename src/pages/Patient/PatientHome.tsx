import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Star, CalendarCheck, ClipboardList, MessageSquare, User } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const quickActions = [
  { id: 'book', name: '预约检查', icon: CalendarCheck, color: 'blue' },
  { id: 'appointments', name: '我的预约', icon: ClipboardList, color: 'green' },
  { id: 'reports', name: '报告中心', icon: FileText, color: 'purple' },
  { id: 'evaluation', name: '满意度评价', icon: Star, color: 'yellow' },
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

export default function PatientHome() {
  const { currentUser } = useAuthStore();
  const { appointments, getAppointmentsByPatient } = useAppointmentStore();

  const patientAppointments = currentUser ? getAppointmentsByPatient(currentUser.id) : [];
  
  const totalAppointments = patientAppointments.length;
  const pendingExams = patientAppointments.filter(
    (apt) => apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'urgent' || apt.status === 'processing'
  ).length;
  const completedReports = patientAppointments.filter((apt) => apt.reportId).length;
  const recentAppointments = patientAppointments
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
                <h1 className="text-2xl font-bold">{currentUser?.name || '患者'}</h1>
                <p className="text-blue-100 text-sm mt-1">欢迎回到医学影像检查预约平台</p>
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
              title="预约次数"
              value={totalAppointments}
              icon={<Calendar className="w-6 h-6" />}
              color="blue"
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="待查项目"
              value={pendingExams}
              icon={<Clock className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="已出报告"
              value={completedReports}
              icon={<FileText className="w-6 h-6" />}
              color="purple"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷功能</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  立即预约
                </button>
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
                        <h3 className="font-semibold text-gray-800">{appointment.examTypeName}</h3>
                        <p className="text-sm text-gray-500 mt-1">{appointment.branchName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(appointment.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.timeSlot}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          医生：{appointment.doctorName}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appointment.status} />
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
