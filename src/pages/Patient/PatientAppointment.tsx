import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scan,
  Activity,
  Camera,
  HeartPulse,
  TestTube2,
  FlaskConical,
  Heart,
  Microscope,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  MapPin,
  Monitor,
  Calendar,
  User,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { examApi, appointmentApi } from '../../services/api';
import type { ExamType, BranchRecommendation, TimeSlot } from '../../types';

const iconMap: Record<string, React.ElementType> = {
  scan: Scan,
  activity: Activity,
  camera: Camera,
  'heart-pulse': HeartPulse,
  'test-tube-2': TestTube2,
  'flask-conical': FlaskConical,
  heart: Heart,
  microscope: Microscope,
};

const stepTitles = ['选择检查类型', '选择院区', '选择时间段', '确认预约'];

export default function PatientAppointment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchRecommendation | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [recommendations, setRecommendations] = useState<BranchRecommendation[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addNotification } = useNotificationStore();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    const fetchExamTypes = async () => {
      setIsLoading(true);
      try {
        const data = await examApi.getExamTypes();
        setExamTypes(data);
      } catch (err) {
        console.error('获取检查类型失败:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExamTypes();
  }, []);

  const fetchRecommendations = useCallback(async (examTypeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await examApi.getRecommendations(examTypeId);
      setRecommendations(data);
      if (data.length === 0) {
        setError('暂无可用院区，请选择其他检查类型');
      }
    } catch (err) {
      console.error('获取推荐院区失败:', err);
      setError('获取推荐院区失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTimeSlots = useCallback(async (branchId: string, examTypeId: string) => {
    setIsLoading(true);
    try {
      const data = await examApi.getTimeSlots({
        branchId,
        examTypeId,
        date: selectedDate,
      });
      setAvailableTimeSlots(data);
    } catch (err) {
      console.error('获取时间段失败:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const handleSelectExamType = (examType: ExamType) => {
    setSelectedExamType(examType);
    setSelectedBranch(null);
    setSelectedTimeSlot(null);
    fetchRecommendations(examType.id);
  };

  const handleSelectBranch = (branch: BranchRecommendation) => {
    setSelectedBranch(branch);
    setSelectedTimeSlot(null);
    if (selectedExamType) {
      fetchTimeSlots(branch.branch.id, selectedExamType.id);
    }
  };

  useEffect(() => {
    if (selectedBranch && selectedExamType && currentStep === 3) {
      fetchTimeSlots(selectedBranch.branch.id, selectedExamType.id);
    }
  }, [selectedDate, selectedBranch, selectedExamType, currentStep, fetchTimeSlots]);

  const handleNext = () => {
    if (currentStep === 1 && selectedExamType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedBranch) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedTimeSlot) {
      setCurrentStep(4);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedExamType(null);
    setSelectedBranch(null);
    setSelectedTimeSlot(null);
    setIsSuccess(false);
    setRecommendations([]);
    setAvailableTimeSlots([]);
  };

  const handleSubmit = async () => {
    if (!selectedExamType || !selectedBranch || !selectedTimeSlot || !currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const newAppointment = await appointmentApi.createAppointment({
        patientId: currentUser.id,
        patientName: currentUser.name,
        patientPhone: currentUser.phone,
        doctorId: 'doctor-1',
        doctorName: '王医生',
        examTypeId: selectedExamType.id,
        examTypeName: selectedExamType.name,
        branchId: selectedBranch.branch.id,
        branchName: selectedBranch.branch.name,
        deviceId: 'dev-1',
        deviceName: '设备-01',
        date: selectedDate,
        timeSlot: selectedTimeSlot.time,
        status: 'pending',
        isUrgent: false,
      });

      if (newAppointment) {
        addNotification({
          userId: currentUser.id,
          type: 'appointment',
          title: '预约申请已提交',
          content: `您已成功预约${selectedBranch.branch.name}${selectedExamType.name}，时间为${selectedDate} ${selectedTimeSlot.time}，请等待确认。`,
          relatedId: newAppointment.id,
          relatedType: 'appointment',
        });

        setIsSubmitting(false);
        setIsSuccess(true);
      } else {
        throw new Error('预约创建失败');
      }
    } catch (err) {
      console.error('提交预约失败:', err);
      setError('预约提交失败，请稍后重试');
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedExamType;
      case 2:
        return !!selectedBranch;
      case 3:
        return !!selectedTimeSlot;
      default:
        return false;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '推荐';
    if (score >= 60) return '一般';
    return '不推荐';
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">预约成功</h2>
          <p className="text-gray-600 mb-6">
            您的预约申请已提交，请等待医院确认。我们会通过短信通知您预约结果。
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">检查项目</span>
              <span className="font-medium">{selectedExamType?.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">就诊院区</span>
              <span className="font-medium">{selectedBranch?.branch.name}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">预约日期</span>
              <span className="font-medium">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">预约时间</span>
              <span className="font-medium">{selectedTimeSlot?.time}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              继续预约
            </button>
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">预约检查</h1>
          </div>

          <div className="flex items-center justify-between mt-4">
            {stepTitles.map((title, index) => {
              const stepNum = index + 1;
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;

              return (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {title}
                    </span>
                  </div>
                  {stepNum < 4 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">请选择检查类型</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examTypes.map((examType) => {
                  const Icon = iconMap[examType.icon] || Scan;
                  const isSelected = selectedExamType?.id === examType.id;

                  return (
                    <motion.div
                      key={examType.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelectExamType(examType)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-500' : 'bg-gray-100'
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{examType.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{examType.category}</p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {examType.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {examType.duration}分钟
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              ¥{examType.price}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {!isLoading && currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">选择就诊院区</h2>
              <p className="text-gray-500 mb-4">
                系统为您智能推荐以下院区，综合考虑了设备忙闲度、排队人数和距离因素
              </p>
              <div className="space-y-4">
                {recommendations.map((rec, index) => {
                  const isSelected = selectedBranch?.branch.id === rec.branch.id;

                  return (
                    <motion.div
                      key={rec.branch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectBranch(rec)}
                      className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {index === 0 && (
                        <div className="absolute -top-3 -left-3">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                            <Award className="w-3 h-3" />
                            最优推荐
                          </span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">
                              {rec.branch.name}
                            </h3>
                            <span
                              className={`text-lg font-bold ${getScoreColor(rec.score)}`}
                            >
                              {rec.score}分
                            </span>
                            <StatusBadge
                              status={getScoreLabel(rec.score) === '推荐' ? 'confirmed' : getScoreLabel(rec.score) === '一般' ? 'pending' : 'cancelled'}
                            />
                          </div>
                          <p className="text-gray-500 mt-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {rec.branch.address}
                          </p>
                          <div className="flex flex-wrap gap-6 mt-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">平均等待</p>
                                <p className="font-semibold text-gray-800">
                                  约{rec.avgWaitTime}分钟
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Monitor className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">可用设备</p>
                                <p className="font-semibold text-gray-800">
                                  {rec.deviceCount}台
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">可预约时段</p>
                                <p className="font-semibold text-gray-800">
                                  {rec.availableSlots.filter((s) => s.available).length}个
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center relative">
                            <svg className="w-full h-full -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="34"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="34"
                                fill="none"
                                stroke={rec.score >= 80 ? '#10b981' : rec.score >= 60 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="6"
                                strokeDasharray={`${(rec.score / 100) * 213.6} 213.6`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <TrendingUp className={`w-6 h-6 ${getScoreColor(rec.score)}`} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {!isLoading && currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">选择时间段</h2>
              <p className="text-gray-500 mb-4">
                {selectedBranch?.branch.name} - {selectedExamType?.name}
              </p>

              <div className="bg-white rounded-xl p-4 mb-6 shadow-card">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择日期
                </label>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-card">
                <h3 className="font-medium text-gray-800 mb-4">可预约时间段</h3>
                {availableTimeSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    该日期暂无可用时间段
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {availableTimeSlots.map((slot) => {
                      const isSelected = selectedTimeSlot?.time === slot.time;
                      const isFull = !slot.available;

                      return (
                        <button
                          key={slot.time}
                          onClick={() => !isFull && setSelectedTimeSlot(slot)}
                          disabled={isFull}
                          className={`p-2 text-sm rounded-lg font-medium transition-all ${
                            isFull
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!isLoading && currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">确认预约信息</h2>
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{selectedExamType?.name}</h3>
                  <p className="text-blue-100">{selectedExamType?.category}</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">患者信息</p>
                      <p className="font-medium text-gray-800">
                        {currentUser?.name}
                        <span className="text-gray-400 ml-2">{currentUser?.phone}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">就诊院区</p>
                      <p className="font-medium text-gray-800">
                        {selectedBranch?.branch.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedBranch?.branch.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">预约日期</p>
                      <p className="font-medium text-gray-800">{selectedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">预约时间</p>
                      <p className="font-medium text-gray-800">
                        {selectedTimeSlot?.time}
                        <span className="text-gray-400 ml-2">
                          (约{selectedExamType?.duration}分钟)
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-gray-600">检查费用</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ¥{selectedExamType?.price}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>温馨提示：</strong>请您在预约时间前30分钟到达医院，携带有效身份证件和相关检查资料。如无法按时就诊，请提前24小时取消预约。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && currentStep < 4 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isLoading && currentStep === 4 && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  确认预约
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
