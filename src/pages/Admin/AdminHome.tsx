import { motion } from 'framer-motion';
import { Activity, DollarSign, Clock, AlertTriangle, BarChart3, FileText, PieChart, Calendar, User } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const quickEntries = [
  { id: 'overview', name: '全局概览', icon: BarChart3, color: 'blue', path: '/admin/overview' },
  { id: 'reports', name: '运营报告', icon: FileText, color: 'green', path: '/admin/reports' },
  { id: 'distribution', name: '收入分布', icon: PieChart, color: 'purple', path: '/admin/distribution' },
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

export default function AdminHome() {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '上午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
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
                <p className="text-blue-300 text-sm">{getGreeting()}</p>
                <h1 className="text-2xl font-bold text-white">{currentUser?.name || '管理员'}</h1>
                <p className="text-blue-300 text-sm mt-1">
                  {currentUser?.department || '欢迎回到医学影像检查运营管理平台'}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-blue-300" />
              <span className="text-sm text-blue-200">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-white mb-4">核心指标</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="本月检查量"
              value="15,600"
              icon={<Activity className="w-6 h-6" />}
              trend={{ value: 12.5, isPositive: true }}
              color="blue"
              className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all"
            />
            <StatCard
              title="总收入"
              value="¥3,580,000"
              icon={<DollarSign className="w-6 h-6" />}
              trend={{ value: 8.2, isPositive: true }}
              color="green"
              className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all"
            />
            <StatCard
              title="平均等待时间"
              value="32分钟"
              icon={<Clock className="w-6 h-6" />}
              trend={{ value: 5.3, isPositive: false }}
              color="yellow"
              className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all"
            />
            <StatCard
              title="设备故障率"
              value="1.2%"
              icon={<AlertTriangle className="w-6 h-6" />}
              trend={{ value: 0.8, isPositive: false }}
              color="red"
              className="bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-white mb-4">快捷入口</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickEntries.map((entry) => {
              const Icon = entry.icon;
              const colorClasses = {
                blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:from-blue-500/30 hover:to-blue-600/30',
                green: 'from-green-500/20 to-green-600/20 border-green-500/30 hover:from-green-500/30 hover:to-green-600/30',
                purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:from-purple-500/30 hover:to-purple-600/30',
                yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:from-yellow-500/30 hover:to-yellow-600/30',
              };
              const iconColorClasses = {
                blue: 'text-blue-400',
                green: 'text-green-400',
                purple: 'text-purple-400',
                yellow: 'text-yellow-400',
              };
              return (
                <motion.button
                  key={entry.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(entry.path)}
                  className={`bg-gradient-to-br ${colorClasses[entry.color as keyof typeof colorClasses]} backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 flex flex-col items-center gap-4`}
                >
                  <div className={`p-5 rounded-2xl bg-white/10`}>
                    <Icon className={`w-8 h-8 ${iconColorClasses[entry.color as keyof typeof iconColorClasses]}`} />
                  </div>
                  <span className="text-base font-medium text-white">{entry.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">实时动态</h3>
            <div className="space-y-3">
              {[
                { time: '10:32', content: '中心院区CT-02完成第35例检查', type: 'success' },
                { time: '10:28', content: '东院区MRI-01设备恢复正常运行', type: 'info' },
                { time: '10:15', content: '患者李四的急诊MRI检查已完成', type: 'warning' },
                { time: '10:02', content: '西院区新增预约B超检查5例', type: 'success' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                >
                  <span className="text-xs text-gray-400 mt-0.5 w-12">{item.time}</span>
                  <span className="text-sm text-gray-300">{item.content}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">设备状态概览</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: '正常运行', count: 11, color: 'text-green-400', bg: 'bg-green-500/20' },
                { name: '使用中', count: 8, color: 'text-blue-400', bg: 'bg-blue-500/20' },
                { name: '维护中', count: 1, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
              ].map((status, index) => (
                <div key={index} className={`${status.bg} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${status.color}`}>{status.count}</p>
                  <p className="text-xs text-gray-400 mt-1">{status.name}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { name: 'CT-01', branch: '中心院区', status: '正常', load: 70 },
                { name: 'MRI-02', branch: '东院区', status: '维护中', load: 0 },
                { name: 'DR-02', branch: '东院区', status: '正常', load: 54 },
              ].map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm text-white font-medium">{device.name}</p>
                    <p className="text-xs text-gray-400">{device.branch}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${device.load > 0 ? 'bg-blue-500' : 'bg-gray-500'}`}
                        style={{ width: `${device.load}%` }}
                      />
                    </div>
                    <span className={`text-xs ${device.status === '正常' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {device.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
