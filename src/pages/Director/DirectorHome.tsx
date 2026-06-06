import { motion } from 'framer-motion';
import { Activity, Users, Clock, XCircle, Monitor, Settings, Trophy, User, Calendar } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const quickActions = [
  { id: 'devices', name: '设备监控', icon: Monitor, color: 'blue', path: '/director/devices' },
  { id: 'capacity', name: '容量设置', icon: Settings, color: 'green', path: '/director/capacity' },
  { id: 'satisfaction', name: '满意度排名', icon: Trophy, color: 'yellow', path: '/director/satisfaction' },
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

export default function DirectorHome() {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const totalExams = 15600;
  const avgDeviceUtilization = 68;
  const avgWaitTime = 32;
  const cancellationRate = 3.8;

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
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
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
                <p className="text-indigo-100 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold">{currentUser?.name || '主任'}</h1>
                <p className="text-indigo-100 text-sm mt-1">{currentUser?.department || '欢迎回到医学影像检查预约平台'}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">关键指标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="总检查量"
              value={totalExams.toLocaleString()}
              icon={<Activity className="w-6 h-6" />}
              color="blue"
              trend={{ value: 8.5, isPositive: true }}
            />
            <StatCard
              title="平均设备使用率"
              value={`${avgDeviceUtilization}%`}
              icon={<Users className="w-6 h-6" />}
              color="green"
              trend={{ value: 5.2, isPositive: true }}
            />
            <StatCard
              title="平均排队时长"
              value={`${avgWaitTime}分钟`}
              icon={<Clock className="w-6 h-6" />}
              color="yellow"
              trend={{ value: 12.3, isPositive: false }}
            />
            <StatCard
              title="退单率"
              value={`${cancellationRate}%`}
              icon={<XCircle className="w-6 h-6" />}
              color="red"
              trend={{ value: 2.1, isPositive: false }}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷入口</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
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
