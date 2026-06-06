import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, AlertTriangle, X, Check, Calendar, Clock, MapPin, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Appointment, AppointmentStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { mockUsers } from '@/data/mockData';

const statusFilters: { value: 'all' | AppointmentStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'urgent', label: '急诊加急' },
  { value: 'processing', label: '检查中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export default function DoctorAppointments() {
  const { currentUser } = useAuthStore();
  const { getAppointmentsByDoctor, markAsUrgent } = useAppointmentStore();
  const { addNotification } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | AppointmentStatus>('all');
  const [urgentDialogOpen, setUrgentDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const appointments = currentUser ? getAppointmentsByDoctor(currentUser.id) : [];

  const filteredAppointments = useMemo(() => {
    let result = [...appointments];

    if (activeFilter !== 'all') {
      result = result.filter((apt) => apt.status === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(query) ||
          apt.examTypeName.toLowerCase().includes(query) ||
          apt.branchName.toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, activeFilter, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const handleOpenUrgentDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setUrgentDialogOpen(true);
  };

  const handleCloseUrgentDialog = () => {
    setUrgentDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleMarkAsUrgent = async () => {
    if (!selectedAppointment) return;

    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    markAsUrgent(selectedAppointment.id);

    const technicians = mockUsers.filter((u) => u.role === 'technician');
    technicians.forEach((tech) => {
      addNotification({
        userId: tech.id,
        type: 'urgent',
        title: '急诊加急通知',
        content: `患者${selectedAppointment.patientName}的${selectedAppointment.examTypeName}已标记为急诊加急，请优先安排检查。`,
        relatedId: selectedAppointment.id,
        relatedType: 'appointment',
      });
    });

    setIsProcessing(false);
    handleCloseUrgentDialog();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">预约管理</h1>
          <p className="text-gray-500 mt-1">查看和管理您的患者预约记录</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索患者姓名、检查类型、院区..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  activeFilter === filter.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    患者姓名
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    检查类型
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    院区
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    预约时间
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500">暂无预约记录</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment, index) => (
                    <motion.tr
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                            <p className="text-sm text-gray-500">{appointment.patientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{appointment.examTypeName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{appointment.branchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {appointment.timeSlot}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {appointment.isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                              <AlertTriangle className="w-3 h-3" />
                              急诊加急
                            </span>
                          )}
                          <StatusBadge status={appointment.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!appointment.isUrgent &&
                          appointment.status !== 'completed' &&
                          appointment.status !== 'cancelled' && (
                            <button
                              onClick={() => handleOpenUrgentDialog(appointment)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              标记加急
                            </button>
                          )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {urgentDialogOpen && selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseUrgentDialog}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">确认标记加急</h3>
                  <button
                    onClick={handleCloseUrgentDialog}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-red-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">急诊加急提醒</p>
                      <p className="text-sm text-red-600 mt-1">
                        标记为急诊加急后，该预约将优先安排，系统会通知所有技师优先处理。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">患者姓名</span>
                    <span className="font-medium text-gray-900">{selectedAppointment.patientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">检查类型</span>
                    <span className="font-medium text-gray-900">{selectedAppointment.examTypeName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">院区</span>
                    <span className="font-medium text-gray-900">{selectedAppointment.branchName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">预约时间</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(selectedAppointment.date)} {selectedAppointment.timeSlot}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseUrgentDialog}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleMarkAsUrgent}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        确认加急
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
