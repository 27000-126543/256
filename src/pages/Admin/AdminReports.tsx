import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Activity,
  DollarSign,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { mockOperationReports } from '@/data/mockData';
import type { OperationReport } from '@/types';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const allReports: OperationReport[] = [
  ...mockOperationReports,
  {
    id: 'report-ops-202404',
    month: '2024-04',
    branchStats: [
      { branchId: 'branch-1', branchName: '中心院区', examCount: 8900, avgWaitTime: 42, deviceUtilization: 75, cancellationRate: 4.8, revenue: 2280000 },
      { branchId: 'branch-2', branchName: '东院区', examCount: 2900, avgWaitTime: 32, deviceUtilization: 62, cancellationRate: 4.2, revenue: 650000 },
      { branchId: 'branch-3', branchName: '西院区', examCount: 2400, avgWaitTime: 28, deviceUtilization: 60, cancellationRate: 3.9, revenue: 320000 },
    ],
    totalExams: 14200,
    avgWaitTime: 36,
    recheckRate: 6.2,
    deviceFailures: 5,
    totalRevenue: 3250000,
    generatedAt: '2024-05-01T00:05:00.000Z',
  },
  {
    id: 'report-ops-202403',
    month: '2024-03',
    branchStats: [
      { branchId: 'branch-1', branchName: '中心院区', examCount: 8600, avgWaitTime: 45, deviceUtilization: 72, cancellationRate: 5.1, revenue: 2180000 },
      { branchId: 'branch-2', branchName: '东院区', examCount: 2800, avgWaitTime: 35, deviceUtilization: 60, cancellationRate: 4.5, revenue: 590000 },
      { branchId: 'branch-3', branchName: '西院区', examCount: 2400, avgWaitTime: 30, deviceUtilization: 58, cancellationRate: 4.1, revenue: 350000 },
    ],
    totalExams: 13800,
    avgWaitTime: 38,
    recheckRate: 6.5,
    deviceFailures: 4,
    totalRevenue: 3120000,
    generatedAt: '2024-04-01T00:05:00.000Z',
  },
];

export default function AdminReports() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const parts = month.split('-');
    return `${parts[0]}年${parts[1]}月`;
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const handleDownload = async (report: OperationReport) => {
    setDownloadingId(report.id);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const content = `
医学影像检查运营报告
${formatMonth(report.month)}
=====================================

一、总体数据
- 总检查量：${report.totalExams.toLocaleString()} 例
- 总收入：${formatCurrency(report.totalRevenue)}
- 平均等待时间：${report.avgWaitTime} 分钟
- 复查率：${report.recheckRate}%
- 设备故障数：${report.deviceFailures} 次

二、各院区数据明细
${report.branchStats.map((bs) => `
【${bs.branchName}】
- 检查量：${bs.examCount.toLocaleString()} 例
- 收入：${formatCurrency(bs.revenue)}
- 平均等待时间：${bs.avgWaitTime} 分钟
- 设备利用率：${bs.deviceUtilization}%
- 取消率：${bs.cancellationRate}%
`).join('')}

报告生成时间：${formatDate(report.generatedAt)}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `运营报告_${report.month}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setDownloadingId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">运营报告</h1>
            <p className="text-sm text-gray-500 mt-1">查看和下载月度运营报告</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {allReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(report.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {formatMonth(report.month)} 运营报告
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        生成时间：{formatDate(report.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(report);
                      }}
                      disabled={downloadingId === report.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === report.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          下载中...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          下载报告
                        </>
                      )}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      {expandedId === report.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Activity className="w-4 h-4" />
                      总检查量
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {report.totalExams.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <DollarSign className="w-4 h-4" />
                      总收入
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(report.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      平均等待时间
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {report.avgWaitTime}分钟
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <CheckCircle2 className="w-4 h-4" />
                      复查率
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      {report.recheckRate}%
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === report.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-100 p-5 bg-gray-50">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        各院区数据明细
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {report.branchStats.map((bs) => (
                          <div
                            key={bs.branchId}
                            className="bg-white rounded-lg p-4 shadow-sm"
                          >
                            <h5 className="font-medium text-gray-800 mb-3">
                              {bs.branchName}
                            </h5>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">检查量</span>
                                <span className="font-medium text-gray-800">
                                  {bs.examCount.toLocaleString()} 例
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">收入</span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(bs.revenue)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">平均等待时间</span>
                                <span className="font-medium text-gray-800">
                                  {bs.avgWaitTime} 分钟
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">设备利用率</span>
                                <span className="font-medium text-gray-800">
                                  {bs.deviceUtilization}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">取消率</span>
                                <span className="font-medium text-gray-800">
                                  {bs.cancellationRate}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
