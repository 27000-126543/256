import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Calendar, User, MessageSquare, X, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useReportStore } from '../../store/useReportStore';
import type { Appointment } from '../../types';
import { cn } from '../../lib/utils';

interface EvaluationFormData {
  score: number;
  comment: string;
}

interface AppointmentWithEvaluation extends Appointment {
  technicianName: string;
  technicianId: string;
  evaluation?: {
    score: number;
    comment?: string;
    createdAt: string;
  };
}

export default function PatientEvaluate() {
  const { currentUser } = useAuthStore();
  const { getAppointmentsByPatient } = useAppointmentStore();
  const { evaluations, addEvaluation, getReportByAppointment } = useReportStore();
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EvaluationFormData>({
    defaultValues: {
      score: 0,
      comment: '',
    },
  });

  const score = watch('score');

  const completedAppointments: AppointmentWithEvaluation[] = currentUser
    ? getAppointmentsByPatient(currentUser.id)
        .filter((apt) => apt.status === 'completed')
        .map((apt) => {
          const report = getReportByAppointment(apt.id);
          const evaluation = evaluations.find((e) => e.appointmentId === apt.id);
          return {
            ...apt,
            technicianId: report?.technicianId || '',
            technicianName: report?.technicianName || '未分配',
            evaluation: evaluation
              ? {
                  score: evaluation.score,
                  comment: evaluation.comment,
                  createdAt: evaluation.createdAt,
                }
              : undefined,
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const pendingEvaluations = completedAppointments.filter((apt) => !apt.evaluation);
  const completedEvaluations = completedAppointments.filter((apt) => apt.evaluation);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleOpenModal = (appointment: AppointmentWithEvaluation) => {
    setSelectedAppointment(appointment);
    reset({ score: 0, comment: '' });
  };

  const handleCloseModal = () => {
    setSelectedAppointment(null);
    reset();
  };

  const handleScoreClick = (value: number) => {
    setValue('score', value, { shouldValidate: true });
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    addEvaluation({
      appointmentId: selectedAppointment.id,
      technicianId: selectedAppointment.technicianId,
      technicianName: selectedAppointment.technicianName,
      score: data.score,
      comment: data.comment || undefined,
    });

    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleCloseModal();
    }, 1500);
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => handleScoreClick(star) : undefined}
            className={cn(
              'transition-all duration-200',
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            )}
            disabled={!interactive}
          >
            <Star
              className={cn(
                'w-6 h-6',
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">满意度评价</h1>
        <p className="text-gray-500 mt-1">对已完成的检查服务进行评价</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">待评价</p>
              <p className="text-2xl font-bold text-gray-900">{pendingEvaluations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">已评价</p>
              <p className="text-2xl font-bold text-gray-900">{completedEvaluations.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-blue-600 fill-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">平均评分</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedEvaluations.length > 0
                  ? (
                      completedEvaluations.reduce((sum, apt) => sum + (apt.evaluation?.score || 0), 0) /
                      completedEvaluations.length
                    ).toFixed(1)
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {pendingEvaluations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">待评价检查</h2>
          <div className="space-y-4">
            {pendingEvaluations.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.examTypeName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        预约号: {appointment.id}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      待评价
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        <p className="text-sm text-gray-500">检查日期</p>
                        <p className="font-medium text-gray-900">{formatDate(appointment.date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">技师</p>
                        <p className="font-medium text-gray-900">{appointment.technicianName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleOpenModal(appointment)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Star className="w-4 h-4" />
                      去评价
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {completedEvaluations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">历史评价</h2>
          <div className="space-y-4">
            {completedEvaluations.map((appointment, index) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.examTypeName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {appointment.branchName} | {appointment.technicianName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        已评价
                      </span>
                      {renderStars(appointment.evaluation?.score || 0)}
                    </div>
                  </div>

                  {appointment.evaluation?.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "{appointment.evaluation.comment}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-400 pt-2">
                    <span>检查日期: {formatDate(appointment.date)}</span>
                    <span>
                      评价时间: {new Date(appointment.evaluation?.createdAt || '').toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {completedAppointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无检查记录</h3>
          <p className="text-gray-500">您还没有已完成的检查记录，完成检查后可在此进行评价</p>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {showSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">评价提交成功</h3>
                  <p className="text-gray-500">感谢您的宝贵意见！</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">服务评价</h3>
                    <button
                      onClick={handleCloseModal}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="font-medium text-gray-900 mb-1">
                        {selectedAppointment.examTypeName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedAppointment.branchName} | {selectedAppointment.technicianName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(selectedAppointment.date)} {selectedAppointment.timeSlot}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        服务评分
                      </label>
                      <div className="flex items-center gap-2">
                        {renderStars(score, true)}
                        <span className="ml-2 text-sm text-gray-500">
                          {score > 0 ? `${score} 分` : '请点击评分'}
                        </span>
                      </div>
                      <input type="hidden" {...register('score', { required: '请选择评分', min: 1 })} />
                      {errors.score && (
                        <p className="text-red-500 text-sm mt-2">{errors.score.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        评价内容
                        <span className="text-gray-400 font-normal ml-1">(选填)</span>
                      </label>
                      <textarea
                        {...register('comment', { maxLength: { value: 500, message: '评价内容不能超过500字' } })}
                        rows={4}
                        placeholder="请分享您的检查体验和建议..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                      {errors.comment && (
                        <p className="text-red-500 text-sm mt-2">{errors.comment.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || score === 0}
                        className={cn(
                          'flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2',
                          isSubmitting || score === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            提交中...
                          </>
                        ) : (
                          '提交评价'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
