import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Filter, Save, Check } from 'lucide-react';
import { mockDevices, mockBranches, mockExamTypes } from '@/data/mockData';
import type { Device, HospitalBranch, ExamType } from '@/types';

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

export default function DirectorCapacity() {
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [deviceCapacities, setDeviceCapacities] = useState<Record<string, number>>(
    mockDevices.reduce((acc, device) => {
      acc[device.id] = device.dailyCapacity;
      return acc;
    }, {} as Record<string, number>)
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getBranchName = (branchId: string) => {
    const branch = mockBranches.find((b: HospitalBranch) => b.id === branchId);
    return branch?.name || '未知院区';
  };

  const getExamTypeNames = (examTypeIds: string[]) => {
    return examTypeIds
      .map((id) => {
        const examType = mockExamTypes.find((e: ExamType) => e.id === id);
        return examType?.name || '';
      })
      .filter(Boolean)
      .join('、');
  };

  const filteredDevices = mockDevices.filter((device) => {
    const branchMatch = selectedBranch === 'all' || device.branchId === selectedBranch;
    const examTypeMatch = selectedExamType === 'all' || device.examTypeIds.includes(selectedExamType);
    return branchMatch && examTypeMatch;
  });

  const handleCapacityChange = (deviceId: string, newCapacity: number) => {
    setDeviceCapacities((prev) => ({
      ...prev,
      [deviceId]: Math.max(0, newCapacity),
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    setSaveSuccess(true);
    setHasChanges(false);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-7 h-7 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">容量设置</h1>
            </div>
            <p className="text-gray-500">管理各设备的每日检查容量上限</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              saveSuccess
                ? 'bg-green-500 text-white'
                : hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                保存成功
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                保存修改
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">筛选条件：</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">院区：</span>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">检查类型：</span>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                {mockExamTypes.map((examType) => (
                  <option key={examType.id} value={examType.id}>{examType.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属院区</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支持检查类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前负载</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">每日容量上限</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">使用率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDevices.map((device, index) => {
                  const capacity = deviceCapacities[device.id] || device.dailyCapacity;
                  const utilizationRate = capacity > 0 ? Math.round((device.currentLoad / capacity) * 100) : 0;
                  const isModified = capacity !== device.dailyCapacity;
                  return (
                    <motion.tr
                      key={device.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${isModified ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{device.name}</div>
                        <div className="text-xs text-gray-500">{device.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getBranchName(device.branchId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getExamTypeNames(device.examTypeIds)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={utilizationRate >= 80 ? 'text-red-600 font-medium' : utilizationRate >= 60 ? 'text-yellow-600 font-medium' : ''}>
                          {device.currentLoad}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={capacity}
                            onChange={(e) => handleCapacityChange(device.id, parseInt(e.target.value) || 0)}
                            min="0"
                            className={`w-24 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                              isModified ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'
                            }`}
                          />
                          {isModified && (
                            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                              已修改
                            </span>
                          )}
                        </div>
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
                          <span className={`text-sm ${
                            utilizationRate >= 80 ? 'text-red-600' : utilizationRate >= 60 ? 'text-yellow-600' : 'text-gray-600'
                          }`}>
                            {utilizationRate}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3"
          >
            <span className="text-sm text-gray-600">您有未保存的修改</span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              立即保存
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
