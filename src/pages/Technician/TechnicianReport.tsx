import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { User, Calendar, FileUp, X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useReportStore } from '@/store/useReportStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { Appointment } from '@/types';

interface ReportFormData {
  findings: string;
  impression: string;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export default function TechnicianReport() {
  const { currentUser } = useAuthStore();
  const { getReportByAppointment } = useReportStore();
  const { appointments: allAppointments } = useAppointmentStore();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    defaultValues: {
      findings: '',
      impression: '',
    },
  });

  const completedWithoutReport = allAppointments.filter((apt) => {
    if (apt.status !== 'completed') return false;
    const report = getReportByAppointment(apt.id);
    return !report;
  });

  const handleImageUpload = () => {
    const newImages = [
      `https://images.unsplash.com/photo-${1559757175 + Math.floor(Math.random() * 1000)}-${Math.random().toString(36).substr(2, 9)}?w=400&h=300&fit=crop`,
    ];
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const openModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setUploadedImages([]);
    reset();
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setUploadedImages([]);
    reset();
  };

  const onSubmit = async (data: ReportFormData) => {
    if (uploadedImages.length === 0) {
      return;
    }

    if (!selectedAppointment || !currentUser) return;

    setIsSubmitting(true);

    try {
      useReportStore.getState().addReport({
        appointmentId: selectedAppointment.id,
        technicianId: currentUser.id,
        technicianName: currentUser.name,
        images: uploadedImages,
        findings: data.findings,
        impression: data.impression,
        status: 'pending_review',
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-gray-800">报告上传</h1>
          <p className="text-gray-500 mt-1">为已完成的检查上传检查报告</p>
        </motion.div>

        {completedWithoutReport.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">全部完成</h3>
            <p className="text-gray-500 mt-2">所有已完成的检查都已上传报告</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {completedWithoutReport.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-orange-50">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{appointment.patientName}</h3>
                      <p className="text-gray-600 mt-1 font-medium">{appointment.examTypeName}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {appointment.date} {appointment.timeSlot}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {appointment.branchName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <StatusBadge status={appointment.status} />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openModal(appointment)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium text-sm"
                    >
                      <FileUp className="w-4 h-4" />
                      上传报告
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">上传检查报告</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAppointment.patientName} - {selectedAppointment.examTypeName}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    影像图片 <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6">
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {uploadedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img}
                              alt={`影像图片 ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleImageUpload}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                    >
                      <Upload className="w-6 h-6 text-gray-400" />
                      <span className="text-sm text-gray-600">点击上传影像图片</span>
                      <span className="text-xs text-gray-400">支持多图上传</span>
                    </motion.button>
                    {uploadedImages.length === 0 && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        请至少上传一张影像图片
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    检查所见 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('findings', { required: '请输入检查所见' })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    placeholder="请详细描述检查所见..."
                  />
                  {errors.findings && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      {errors.findings.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    诊断印象 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('impression', { required: '请输入诊断印象' })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    placeholder="请输入诊断印象和建议..."
                  />
                  {errors.impression && (
                    <p className="flex items-center gap-1 mt-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      {errors.impression.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || uploadedImages.length === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        提交中...
                      </>
                    ) : (
                      <>
                        <FileUp className="w-5 h-5" />
                        提交报告
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
