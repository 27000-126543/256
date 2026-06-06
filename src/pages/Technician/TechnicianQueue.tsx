import { motion } from 'framer-motion';
import { User, Calendar, Clock, MapPin, AlertTriangle, Play, CheckCircle, Hash } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import type { Appointment } from '@/types';

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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

const pulseKeyframes = {
  pulse: {
    '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
    '50%': { boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)' },
  },
};

export default function TechnicianQueue() {
  const { getAppointmentsByTechnician, updateAppointmentStatus } = useAppointmentStore();

  const appointments = getAppointmentsByTechnician();

  const urgentAppointments = appointments.filter((apt) => apt.isUrgent && apt.status !== 'completed');
  const normalAppointments = appointments.filter((apt) => !apt.isUrgent && apt.status !== 'completed');

  const sortedAppointments = [
    ...urgentAppointments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    ...normalAppointments.sort((a, b) => a.queuePosition - b.queuePosition),
  ];

  const handleStartExam = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'processing');
  };

  const handleCompleteExam = (appointmentId: string) => {
    updateAppointmentStatus(appointmentId, 'completed');
  };

  const renderAppointmentCard = (appointment: Appointment, index: number) => {
    const isUrgent = appointment.isUrgent;

    return (
      <motion.div
        key={appointment.id}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: index * 0.1 }}
        className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${
          isUrgent ? 'border-2 border-red-200' : 'border border-gray-100'
        }`}
        style={isUrgent ? { animation: 'pulse 2s infinite' } : undefined}
      >
        {isUrgent && (
          <motion.div
            variants={pulseKeyframes}
            animate="pulse"
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-2 mb-4 bg-red-50 px-3 py-2 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-600 font-semibold text-sm">急诊加急</span>
          </motion.div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isUrgent ? 'bg-red-50' : 'bg-blue-50'}`}>
              <User className={`w-6 h-6 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800 text-lg">{appointment.patientName}</h3>
                {appointment.queuePosition > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    <Hash className="w-3 h-3" />
                    {appointment.queuePosition}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1 font-medium">{appointment.examTypeName}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {appointment.branchName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {appointment.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {appointment.timeSlot}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={appointment.status} />
            <div className="flex gap-2">
              {appointment.status === 'confirmed' || appointment.status === 'urgent' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartExam(appointment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Play className="w-4 h-4" />
                  开始检查
                </motion.button>
              ) : appointment.status === 'processing' ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCompleteExam(appointment.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  完成检查
                </motion.button>
              ) : null}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-gray-800">检查队列</h1>
          <p className="text-gray-500 mt-1">查看和管理当前等待检查的患者</p>
        </motion.div>

        {sortedAppointments.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">暂无检查队列</h3>
            <p className="text-gray-500 mt-2">当前没有等待检查的预约</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment, index) => renderAppointmentCard(appointment, index))}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
}
