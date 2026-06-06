import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, ArrowLeft, Activity, DollarSign, Clock, Users } from 'lucide-react';
import { mockMonthlyTrend, mockBranches } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

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

const branchExamData = [
  { branch: '中心院区', examCount: 9800, revenue: 2450000 },
  { branch: '东院区', examCount: 3200, revenue: 720000 },
  { branch: '西院区', examCount: 2600, revenue: 410000 },
];

const keyMetrics = [
  {
    title: '本月检查量',
    value: '15,600',
    mom: 12.5,
    yoy: 18.3,
    icon: Activity,
    color: 'blue',
  },
  {
    title: '本月总收入',
    value: '¥3,580,000',
    mom: 8.2,
    yoy: 14.6,
    icon: DollarSign,
    color: 'green',
  },
  {
    title: '平均等待时间',
    value: '32分钟',
    mom: -5.3,
    yoy: -12.1,
    icon: Clock,
    color: 'yellow',
  },
  {
    title: '服务患者数',
    value: '12,450',
    mom: 10.8,
    yoy: 15.2,
    icon: Users,
    color: 'purple',
  },
];

export default function AdminOverview() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const parts = month.split('-');
    return `${parts[1]}月`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">全局概览</h1>
            <p className="text-sm text-gray-500 mt-1">查看全院区运营数据趋势和对比分析</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                green: 'bg-green-50 text-green-600',
                yellow: 'bg-yellow-50 text-yellow-600',
                purple: 'bg-purple-50 text-purple-600',
              };
              return (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">环比</span>
                      <span
                        className={`text-xs font-medium flex items-center gap-0.5 ${
                          metric.mom >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.mom >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(metric.mom)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">同比</span>
                      <span
                        className={`text-xs font-medium flex items-center gap-0.5 ${
                          metric.yoy >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.yoy >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(metric.yoy)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">月度检查量趋势</h2>
              <p className="text-sm text-gray-500 mt-1">近6个月检查量和收入变化趋势</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === '6m'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                近6个月
              </button>
              <button
                onClick={() => setTimeRange('12m')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === '12m'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                近12个月
              </button>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockMonthlyTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `¥${value / 10000}万`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value), '收入'];
                    }
                    return [value.toLocaleString(), '检查量'];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="examCount"
                  name="检查量"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="收入"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">各院区检查量对比</h2>
              <p className="text-sm text-gray-500 mt-1">本月各院区检查量统计</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchExamData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="branch"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), '检查量']}
                  />
                  <Bar
                    dataKey="examCount"
                    name="检查量"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800">各院区收入对比</h2>
              <p className="text-sm text-gray-500 mt-1">本月各院区收入统计</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchExamData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="branch"
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `¥${value / 10000}万`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [formatCurrency(value), '收入']}
                  />
                  <Bar
                    dataKey="revenue"
                    name="收入"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">院区详细数据</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">院区名称</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">检查量</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">收入</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">平均等待时间</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">设备利用率</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">取消率</th>
                </tr>
              </thead>
              <tbody>
                {mockBranches.map((branch, index) => {
                  const stats = [
                    { examCount: 9800, revenue: 2450000, avgWaitTime: 38, deviceUtilization: 78, cancellationRate: 4.2 },
                    { examCount: 3200, revenue: 720000, avgWaitTime: 28, deviceUtilization: 65, cancellationRate: 3.8 },
                    { examCount: 2600, revenue: 410000, avgWaitTime: 25, deviceUtilization: 62, cancellationRate: 3.5 },
                  ][index];
                  return (
                    <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{branch.name}</p>
                            <p className="text-xs text-gray-500">{branch.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-800 font-medium">
                        {stats.examCount.toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                        {formatCurrency(stats.revenue)}
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-800">
                        {stats.avgWaitTime}分钟
                      </td>
                      <td className="text-right py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${stats.deviceUtilization}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-800">{stats.deviceUtilization}%</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-sm text-gray-800">
                        {stats.cancellationRate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
