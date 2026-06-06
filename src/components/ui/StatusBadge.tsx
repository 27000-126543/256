import { cn } from '../../lib/utils';
import type { AppointmentStatus, ReportStatus, NotificationType } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus | ReportStatus | NotificationType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-blue-100 text-blue-800' },
  confirmed: { label: '已确认', className: 'bg-green-100 text-green-800' },
  urgent: { label: '急诊加急', className: 'bg-red-100 text-red-800' },
  processing: { label: '检查中', className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', className: 'bg-gray-100 text-gray-800' },
  draft: { label: '草稿', className: 'bg-gray-100 text-gray-800' },
  pending_review: { label: '待审核', className: 'bg-yellow-100 text-yellow-800' },
  reviewed: { label: '已审核', className: 'bg-green-100 text-green-800' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-800' },
  appointment: { label: '预约通知', className: 'bg-blue-100 text-blue-800' },
  report: { label: '报告通知', className: 'bg-green-100 text-green-800' },
  review: { label: '审核通知', className: 'bg-yellow-100 text-yellow-800' },
  system: { label: '系统通知', className: 'bg-purple-100 text-purple-800' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
