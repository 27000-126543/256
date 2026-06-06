import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Calendar, User, ChevronDown, Download, Image, Stethoscope, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useReportStore } from '../../store/useReportStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Report, ReportStatus, Appointment } from '../../types';
import { cn } from '../../lib/utils';

const statusFilters: { value: 'all' | ReportStatus; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending_review', label: '待审核' },
  { value: 'reviewed', label: '已审核' },
  { value: 'rejected', label: '已驳回' },
];

interface ReportWithAppointment extends Report {
  appointment?: Appointment;
}

export default function PatientReports() {
  const { currentUser } = useAuthStore();
  const { reports } = useReportStore();
  const { getAppointmentById } = useAppointmentStore();
  const [activeFilter, setActiveFilter] = useState<'all' | ReportStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const patientAppointments = currentUser
    ? useAppointmentStore.getState().getAppointmentsByPatient(currentUser.id)
    : [];

  const patientAppointmentIds = new Set(patientAppointments.map((a) => a.id));

  const patientReports: ReportWithAppointment[] = reports
    .filter((r) => patientAppointmentIds.has(r.appointmentId))
    .map((r) => ({
      ...r,
      appointment: getAppointmentById(r.appointmentId),
    }));

  const filteredReports = activeFilter === 'all'
    ? patientReports
    : patientReports.filter((r) => r.status === activeFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const handleDownload = async (report: ReportWithAppointment) => {
    setDownloadingId(report.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`报告已下载：${report.appointment?.examTypeName || '检查报告'}.pdf`);
    setDownloadingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">报告中心</h1>
        <p className="text-gray-500 mt-1">查看您的所有检查报告记录</p>
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

      {filteredReports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无报告记录</h3>
          <p className="text-gray-500">
            {activeFilter === 'all'
              ? '您还没有任何检查报告，完成检查后报告将在这里显示'
              : `当前筛选条件下没有${statusFilters.find((f) => f.value === activeFilter)?.label}的报告`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <ReportCard
              key={report.id}
              report={report}
              index={index}
              expandedId={expandedId}
              toggleExpand={toggleExpand}
              formatDate={formatDate}
              handleDownload={handleDownload}
              downloadingId={downloadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportCardProps {
  report: ReportWithAppointment;
  index: number;
  expandedId: string | null;
  toggleExpand: (id: string) => void;
  formatDate: (dateStr: string) => string;
  handleDownload: (report: ReportWithAppointment) => void;
  downloadingId: string | null;
}

function ReportCard({
  report,
  index,
  expandedId,
  toggleExpand,
  formatDate,
  handleDownload,
  downloadingId,
}: ReportCardProps) {
  const isExpanded = expandedId === report.id;
  const isDownloading = downloadingId === report.id;
  const canDownload = report.status === 'reviewed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div
        className="p-6 cursor-pointer"
        onClick={() => toggleExpand(report.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {report.appointment?.examTypeName || '检查报告'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">报告编号: {report.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={report.status} />
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">院区</p>
              <p className="font-medium text-gray-900">
                {report.appointment?.branchName || '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">检查日期</p>
              <p className="font-medium text-gray-900">
                {report.appointment ? formatDate(report.appointment.date) : formatDate(report.submittedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">技师</p>
              <p className="font-medium text-gray-900">{report.technicianName}</p>
            </div>
          </div>

          {canDownload && (
            <div className="flex items-center justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(report);
                }}
                disabled={isDownloading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isDownloading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                )}
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    下载中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    下载报告
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="pt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">检查所见</h4>
                  </div>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed">
                    {report.findings}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">诊断印象</h4>
                  </div>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4 leading-relaxed">
                    {report.impression}
                  </p>
                </div>

                {report.images && report.images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Image className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">影像图片</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {report.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={img}
                            alt={`影像图片 ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report.reviewerName && (
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                      审核医生: <span className="font-medium text-gray-700">{report.reviewerName}</span>
                    </div>
                    {report.reviewedAt && (
                      <div className="text-sm text-gray-500">
                        审核时间: <span className="font-medium text-gray-700">{formatDate(report.reviewedAt)}</span>
                      </div>
                    )}
                  </div>
                )}

                {report.reviewComment && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">审核意见: </span>
                      {report.reviewComment}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
