import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Appointment, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

const statusFilters: { value: 'all' | AppointmentStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待确认' },
  { value: 'confirmed', label: '已确认' },
  { value: 'processing', label: '检查中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

export default function PatientAppointments() {
  const { currentUser } = useAuthStore();
  const { getAppointmentsByPatient, updateAppointmentStatus } = useAppointmentStore();
  const [activeFilter, setActiveFilter] = useState<'all' | AppointmentStatus>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const appointments = currentUser ? getAppointmentsByPatient(currentUser.id) : [];
  
  const filteredAppointments = activeFilter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === activeFilter);

  const handleCancel = async (appointmentId: string) => {
    setCancellingId(appointmentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateAppointmentStatus(appointmentId, 'cancelled');
    setCancellingId(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">我的预约</h1>
        <p className="text-gray-500 mt-1">查看和管理您的检查预约记录</p>
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
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无预约记录</h3>
          <p className="text-gray-500">
            {activeFilter === 'all' 
              ? '您还没有任何预约记录，快去预约检查吧' 
              : `当前筛选条件下没有${statusFilters.find(f => f.value === activeFilter)?.label}的预约`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              index={index}
              onCancel={handleCancel}
              formatDate={formatDate}
              cancellingId={cancellingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  index: number;
  onCancel: (id: string) => void;
  formatDate: (dateStr: string) => string;
  cancellingId: string | null;
}

function AppointmentCard({ appointment, index, onCancel, formatDate, cancellingId }: AppointmentCardProps) {
  const isCancelling = cancellingId === appointment.id;
  const canCancel = appointment.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{appointment.examTypeName}</h3>
            <p className="text-sm text-gray-500 mt-0.5">预约号: {appointment.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {appointment.isUrgent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                急诊加急
              </span>
            )}
            <StatusBadge status={appointment.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">院区</p>
              <p className="font-medium text-gray-900">{appointment.branchName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">日期</p>
              <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">时段</p>
              <p className="font-medium text-gray-900">{appointment.timeSlot}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">排队位置</p>
              <p className="font-medium text-gray-900">
                {appointment.queuePosition > 0 ? `第 ${appointment.queuePosition} 位` : '无'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            医生: {appointment.doctorName} | 设备: {appointment.deviceName}
          </div>
          
          {canCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              disabled={isCancelling}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                isCancelling
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              )}
            >
              {isCancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  取消中...
                </>
              ) : (
                <>
                  <X className="w-4 h-4" />
                  取消预约
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
