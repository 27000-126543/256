import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Report, ReportStatus, Evaluation } from '../types';
import { mockReports, mockEvaluations } from '../data/mockData';

interface ReportState {
  reports: Report[];
  evaluations: Evaluation[];
  addReport: (report: Omit<Report, 'id' | 'submittedAt'>) => void;
  updateReportStatus: (id: string, status: ReportStatus, reviewerId?: string, reviewerName?: string, reviewComment?: string) => void;
  getReportById: (id: string) => Report | undefined;
  getReportByAppointment: (appointmentId: string) => Report | undefined;
  getReportsByTechnician: (technicianId: string) => Report[];
  getReportsForReview: () => Report[];
  addEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void;
  getEvaluationsByTechnician: (technicianId: string) => Evaluation[];
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: mockReports,
      evaluations: mockEvaluations,
      addReport: (reportData) => {
        const newReport: Report = {
          ...reportData,
          id: `report-${generateId()}`,
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          reports: [...state.reports, newReport],
        }));
      },
      updateReportStatus: (id, status, reviewerId, reviewerName, reviewComment) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  ...(reviewerId && { reviewerId }),
                  ...(reviewerName && { reviewerName }),
                  ...(reviewComment && { reviewComment }),
                  reviewedAt: status === 'reviewed' ? new Date().toISOString() : r.reviewedAt,
                }
              : r
          ),
        }));
      },
      getReportById: (id) => {
        return get().reports.find((r) => r.id === id);
      },
      getReportByAppointment: (appointmentId) => {
        return get().reports.find((r) => r.appointmentId === appointmentId);
      },
      getReportsByTechnician: (technicianId) => {
        return get().reports.filter((r) => r.technicianId === technicianId);
      },
      getReportsForReview: () => {
        return get().reports.filter((r) => r.status === 'pending_review');
      },
      addEvaluation: (evaluationData) => {
        const newEvaluation: Evaluation = {
          ...evaluationData,
          id: `eval-${generateId()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          evaluations: [...state.evaluations, newEvaluation],
        }));
      },
      getEvaluationsByTechnician: (technicianId) => {
        return get().evaluations.filter((e) => e.technicianId === technicianId);
      },
    }),
    {
      name: 'report-storage',
    }
  )
);
