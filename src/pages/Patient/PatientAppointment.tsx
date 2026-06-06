import { useState, useMemo } from 'react';
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
  Star,
  Monitor,
  Calendar,
  User,
  Phone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ExamType, BranchRecommendation, TimeSlot, HospitalBranch } from '../../types';

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
  const [selectedBranch, setSelectedBranch] = useState<BranchRecommendation | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    examTypes,
    selectedExamType,
    setSelectedExamType,
    recommendations,
    generateRecommendations,
    getAvailableTimeSlots,
    addAppointment,
  } = useAppointmentStore();

  const { addNotification } = useNotificationStore();
  const { currentUser } = useAuthStore();

  const availableTimeSlots = useMemo(() => {
    if (!selectedBranch || !selectedExamType) return [];
    return getAvailableTimeSlots(selectedBranch.branch.id, selectedExamType.id, selectedDate);
  }, [selectedBranch, selectedExamType, selectedDate, getAvailableTimeSlots]);

  const handleSelectExamType = (examType: ExamType) => {
    setSelectedExamType(examType);
    generateRecommendations(examType.id);
  };

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
  };

  const handleSubmit = async () => {
    if (!selectedExamType || !selectedBranch || !selectedTimeSlot || !currentUser) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    addAppointment({
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

    addNotification({
      userId: currentUser.id,
      type: 'appointment',
      title: '预约申请已提交',
      content: `您已成功预约${selectedBranch.branch.name}${selectedExamType.name}，时间为${selectedDate} ${selectedTimeSlot.time}，请等待确认。`,
      relatedType: 'appointment',
    });

    setIsSubmitting(false);
    setIsSuccess(true);
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
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
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

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">选择就诊院区</h2>
              <p className="text-gray-500 mb-4">
                系统为您推荐以下院区，综合考虑了等待时间、设备利用率和距离因素
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
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedBranch(rec)}
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

                      {index === 0 && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            最优推荐
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {rec.branch.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {rec.branch.address}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Phone className="w-4 h-4" />
                            {rec.branch.phone}
                          </p>
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            <div className="text-center">
                              <div className="text-xl font-bold">{rec.score}</div>
                              <div className="text-xs opacity-80">推荐分</div>
                            </div>
                          </div>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.round(rec.score / 20)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">平均等待</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {rec.avgWaitTime}分钟
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500">
                            <Monitor className="w-4 h-4" />
                            <span className="text-sm">可用设备</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {rec.deviceCount}台
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">可预约</span>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 mt-1">
                            {rec.availableSlots.filter((s) => s.available).length}个
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">选择预约时间</h2>
              <p className="text-gray-500 mb-4">
                {selectedBranch?.branch.name} - {selectedExamType?.name}
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
                <label className="text-sm font-medium text-gray-700 mb-2 block">选择日期</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <label className="text-sm font-medium text-gray-700 mb-4 block">选择时间段</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimeSlots.map((slot, index) => {
                    const isSelected = selectedTimeSlot?.time === slot.time;

                    return (
                      <motion.button
                        key={slot.time}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                        onClick={() => slot.available && setSelectedTimeSlot(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          !slot.available
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-xs mt-1">
                          {slot.available
                            ? `剩余 ${slot.capacity - slot.booked}/${slot.capacity}`
                            : '已满'}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">确认预约信息</h2>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    患者信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">姓名</span>
                      <p className="font-medium text-gray-900">{currentUser?.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">手机号</span>
                      <p className="font-medium text-gray-900">{currentUser?.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Scan className="w-5 h-5 text-blue-500" />
                    检查信息
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">检查项目</span>
                      <span className="font-medium text-gray-900">{selectedExamType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">检查类型</span>
                      <span className="font-medium text-gray-900">
                        {selectedExamType?.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">预计时长</span>
                      <span className="font-medium text-gray-900">
                        {selectedExamType?.duration}分钟
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">检查费用</span>
                      <span className="font-bold text-blue-600">¥{selectedExamType?.price}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    院区信息
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">院区名称</span>
                      <span className="font-medium text-gray-900">
                        {selectedBranch?.branch.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">院区地址</span>
                      <span className="font-medium text-gray-900 text-right max-w-[60%]">
                        {selectedBranch?.branch.address}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">联系电话</span>
                      <span className="font-medium text-gray-900">
                        {selectedBranch?.branch.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    预约时间
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">预约日期</span>
                      <span className="font-medium text-gray-900">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">预约时段</span>
                      <span className="font-medium text-gray-900">{selectedTimeSlot?.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">预约状态</span>
                      <StatusBadge status="pending" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>温馨提示：</strong>
                  请于预约时间前30分钟到达院区，携带有效身份证件和相关检查资料。如需取消预约，请提前24小时操作。
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex gap-4">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="flex-1 px-6 py-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              上一步
            </button>
          )}

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`flex-1 px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              下一步
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
          )}
        </div>
      </div>
    </div>
  );
}
