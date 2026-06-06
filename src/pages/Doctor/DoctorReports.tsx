import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, X, Eye, User, Calendar, Search } from 'lucide-react';
import { useReportStore } from '../../store/useReportStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useAuthStore } from '../../store/useAuthStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DoctorReports() {
  const { currentUser } = useAuthStore();
  const { reports, getReportsForReview, updateReportStatus } = useReportStore();
  const { appointments } = useAppointmentStore();
  const { addNotification } = useNotificationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [pendingReports, setPendingReports] = useState(reports);

  useEffect(() => {
    setPendingReports(getReportsForReview());
  }, [reports, getReportsForReview]);

  const filteredReports = pendingReports.filter(
    (r) => {
      const apt = appointments.find((a) => a.id === r.appointmentId);
      return (
        apt?.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt?.examTypeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const getAppointmentInfo = (appointmentId: string) => {
    return appointments.find((a) => a.id === appointmentId);
  };

  const handleApprove = (reportId: string) => {
    if (!currentUser) return;
    updateReportStatus(reportId, 'reviewed', currentUser.id, currentUser.name, reviewComment);
    
    const report = reports.find((r) => r.id === reportId);
    const apt = getAppointmentInfo(report?.appointmentId || '');
    
    if (apt) {
      addNotification({
        userId: apt.patientId,
        type: 'report',
        title: '报告已审核通过',
        content: `您的${apt.examTypeName}报告已审核通过，请点击查看详情。`,
        relatedId: reportId,
        relatedType: 'report',
      });
    }
    
    setSelectedReport(null);
    setReviewComment('');
  };

  const handleReject = (reportId: string) => {
    if (!currentUser || !reviewComment) return;
    updateReportStatus(reportId, 'rejected', currentUser.id, currentUser.name, reviewComment);
    
    const report = reports.find((r) => r.id === reportId);
    if (report) {
      addNotification({
        userId: report.technicianId,
        type: 'review',
        title: '报告被驳回',
        content: `您提交的报告被驳回，请查看审核意见后修改重新提交。`,
        relatedId: reportId,
        relatedType: 'report',
      });
    }
    
    setSelectedReport(null);
    setReviewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">报告审核</h1>
          <p className="text-gray-500 mt-1">
            共 {pendingReports.length} 份报告待审核
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索患者姓名、检查类型、技师姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-card p-12 text-center"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">暂无待审核报告</p>
          </motion.div>
        ) : (
          filteredReports.map((report, index) => {
            const apt = getAppointmentInfo(report.appointmentId);
            const isSelected = selectedReport === report.id;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-card overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedReport(isSelected ? null : report.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {apt?.patientName || '未知患者'} - {apt?.examTypeName || '未知检查'}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {report.technicianName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(report.submittedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </span>
                          <span>{apt?.branchName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={report.status} />
                      <Eye className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-5 bg-gray-50 space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">检查所见</h4>
                          <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                            {report.findings}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">诊断印象</h4>
                          <p className="text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                            {report.impression}
                          </p>
                        </div>
                        {report.images.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">影像图片</h4>
                            <div className="grid grid-cols-4 gap-3">
                              {report.images.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`影像${i + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">审核意见</h4>
                          <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="请输入审核意见..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(report.id);
                            }}
                            disabled={!reviewComment}
                            className="flex items-center gap-2 px-5 py-2.5 bg-danger-500 text-white rounded-lg hover:bg-danger-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X className="w-4 h-4" />
                            驳回
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(report.id);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-success-500 text-white rounded-lg hover:bg-success-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            通过
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
