import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, MessageSquare, X, User, Calendar } from 'lucide-react';
import { mockTechnicianRankings, mockEvaluations } from '@/data/mockData';
import type { TechnicianRanking, Evaluation } from '@/types';
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

const medalColors = [
  'text-yellow-500',
  'text-gray-400',
  'text-amber-600',
];

const medalBgColors = [
  'bg-yellow-100',
  'bg-gray-100',
  'bg-amber-100',
];

export default function DirectorSatisfaction() {
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianRanking | null>(null);

  const getTechnicianEvaluations = (technicianId: string) => {
    return mockEvaluations.filter((e: Evaluation) => e.technicianId === technicianId);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年MM月dd日 HH:mm', { locale: zhCN });
    } catch {
      return dateStr;
    }
  };

  const renderStars = (score: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const sortedRankings = [...mockTechnicianRankings].sort((a, b) => b.avgScore - a.avgScore);

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
            <Trophy className="w-7 h-7 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">满意度排名</h1>
          </div>
          <p className="text-gray-500">技师满意度排行榜及详细评价</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">技师满意度排行榜</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">技师姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedRankings.map((technician, index) => {
                  const isTopThree = index < 3;
                  return (
                    <motion.tr
                      key={technician.technicianId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        index === 0 ? 'bg-yellow-50/50' : index === 1 ? 'bg-gray-50/50' : index === 2 ? 'bg-amber-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isTopThree ? (
                            <div className={`w-8 h-8 rounded-full ${medalBgColors[index]} flex items-center justify-center`}>
                              <Trophy className={`w-5 h-5 ${medalColors[index]}`} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-500">{index + 1}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="font-medium text-gray-800">{technician.technicianName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-800">{technician.avgScore.toFixed(1)}</span>
                          <div className="flex items-center">
                            {renderStars(Math.round(technician.avgScore))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {technician.evaluationCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {technician.examCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTechnician(technician)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          查看评价
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {selectedTechnician && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTechnician(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{selectedTechnician.technicianName}</h3>
                  <p className="text-sm text-gray-500">详细评价列表</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTechnician(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{selectedTechnician.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500 mt-1">平均分</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedTechnician.evaluationCount}</p>
                  <p className="text-xs text-gray-500 mt-1">评价数</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedTechnician.examCount}</p>
                  <p className="text-xs text-gray-500 mt-1">检查数</p>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                {getTechnicianEvaluations(selectedTechnician.technicianId).map((evaluation, index) => (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {renderStars(evaluation.score)}
                        <span className="text-sm font-medium text-gray-700">{evaluation.score}分</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(evaluation.createdAt)}
                      </div>
                    </div>
                    {evaluation.comment && (
                      <p className="text-sm text-gray-600 mt-2">{evaluation.comment}</p>
                    )}
                  </motion.div>
                ))}
                {getTechnicianEvaluations(selectedTechnician.technicianId).length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">暂无评价记录</p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTechnician(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
