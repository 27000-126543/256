import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Monitor, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockDevices, mockBranches } from '@/data/mockData';
import type { Device, HospitalBranch } from '@/types';

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

const deviceStatusConfig: Record<string, { label: string; className: string }> = {
  available: { label: '空闲', className: 'bg-green-100 text-green-800' },
  busy: { label: '忙碌', className: 'bg-yellow-100 text-yellow-800' },
  maintenance: { label: '维护中', className: 'bg-red-100 text-red-800' },
};

export default function DirectorDevices() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

  const getBranchName = (branchId: string) => {
    const branch = mockBranches.find((b: HospitalBranch) => b.id === branchId);
    return branch?.name || '未知院区';
  };

  const getDeviceUtilizationRate = (device: Device) => {
    return Math.round((device.currentLoad / device.dailyCapacity) * 100);
  };

  const utilizationData = mockBranches.map((branch) => {
    const branchDevices = mockDevices.filter((d) => d.branchId === branch.id);
    const avgUtilization = branchDevices.length > 0
      ? Math.round(branchDevices.reduce((sum, d) => sum + getDeviceUtilizationRate(d), 0) / branchDevices.length)
      : 0;
    return {
      name: branch.name,
      使用率: avgUtilization,
    };
  });

  const waitTimeData = [
    { name: '中心院区', 平均排队时长: 38 },
    { name: '东院区', 平均排队时长: 28 },
    { name: '西院区', 平均排队时长: 25 },
  ];

  const filteredDevices = selectedBranch === 'all'
    ? mockDevices
    : mockDevices.filter((d) => d.branchId === selectedBranch);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">设备监控</h1>
          </div>
          <p className="text-gray-500">实时监控各院区设备运行状态</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">按院区筛选：</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">全部院区</option>
              {mockBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">各院区设备使用率对比</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, '设备使用率']}
                  />
                  <Bar dataKey="使用率" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">各院区平均排队时长对比</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waitTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} unit="分钟" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}分钟`, '平均排队时长']}
                  />
                  <Bar dataKey="平均排队时长" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">设备列表</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属院区</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">今日容量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前负载</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevices.map((device, index) => {
                  const utilizationRate = getDeviceUtilizationRate(device);
                  const statusConfig = deviceStatusConfig[device.status];
                  return (
                    <motion.tr
                      key={device.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getBranchName(device.branchId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {device.dailyCapacity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {device.currentLoad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilizationRate >= 80 ? 'bg-red-500' : utilizationRate >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{utilizationRate}%</span>
                        </div>
                      </td>
                    </motion.tr>
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
