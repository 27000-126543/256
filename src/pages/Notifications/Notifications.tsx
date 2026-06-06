import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Calendar, FileText, AlertTriangle, Activity, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { NotificationType } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  appointment: <Calendar className="w-5 h-5" />,
  report: <FileText className="w-5 h-5" />,
  urgent: <AlertTriangle className="w-5 h-5" />,
  review: <MessageSquare className="w-5 h-5" />,
  system: <Activity className="w-5 h-5" />,
};

const typeColors: Record<NotificationType, string> = {
  appointment: 'bg-blue-100 text-blue-600',
  report: 'bg-green-100 text-green-600',
  urgent: 'bg-red-100 text-red-600',
  review: 'bg-yellow-100 text-yellow-600',
  system: 'bg-purple-100 text-purple-600',
};

export default function Notifications() {
  const { currentUser } = useAuthStore();
  const { notifications, getNotificationsByUser, markAsRead, markAllAsRead } = useNotificationStore();
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [userNotifications, setUserNotifications] = useState<typeof notifications>([]);

  useEffect(() => {
    if (currentUser) {
      setUserNotifications(getNotificationsByUser(currentUser.id));
    }
  }, [currentUser, notifications, getNotificationsByUser]);

  const filteredNotifications = filter === 'all'
    ? userNotifications
    : userNotifications.filter((n) => n.type === filter);

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    if (currentUser) {
      markAllAsRead(currentUser.id);
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const filterOptions: { value: NotificationType | 'all'; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'appointment', label: '预约通知' },
    { value: 'urgent', label: '加急通知' },
    { value: 'report', label: '报告通知' },
    { value: 'review', label: '审核通知' },
    { value: 'system', label: '系统通知' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">通知中心</h1>
          <p className="text-gray-500 mt-1">
            共 {userNotifications.length} 条通知，{unreadCount} 条未读
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          全部已读
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === option.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-card p-12 text-center"
            >
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">暂无通知</p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                className={`bg-white rounded-xl shadow-card p-5 cursor-pointer transition-all hover:shadow-card-hover ${
                  !notification.isRead ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${typeColors[notification.type]}`}>
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StatusBadge status={notification.type} />
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">{notification.content}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
