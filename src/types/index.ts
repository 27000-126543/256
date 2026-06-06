export type UserRole = 'patient' | 'doctor' | 'technician' | 'director' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  idCard?: string;
  employeeId?: string;
  department?: string;
  avatar?: string;
}

export interface ExamType {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  icon: string;
}

export interface HospitalBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance?: number;
}

export interface Device {
  id: string;
  name: string;
  model: string;
  branchId: string;
  examTypeIds: string[];
  status: 'available' | 'busy' | 'maintenance';
  dailyCapacity: number;
  currentLoad: number;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'urgent' | 'processing' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  examTypeId: string;
  examTypeName: string;
  branchId: string;
  branchName: string;
  deviceId: string;
  deviceName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  isUrgent: boolean;
  queuePosition: number;
  estimatedWaitTime: number;
  createdAt: string;
  reportId?: string;
}

export type ReportStatus = 'draft' | 'pending_review' | 'reviewed' | 'rejected';

export interface Report {
  id: string;
  appointmentId: string;
  technicianId: string;
  technicianName: string;
  images: string[];
  findings: string;
  impression: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewComment?: string;
  status: ReportStatus;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Evaluation {
  id: string;
  appointmentId: string;
  technicianId: string;
  technicianName: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export type NotificationType = 'appointment' | 'urgent' | 'report' | 'review' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

export interface BranchRecommendation {
  branch: HospitalBranch;
  score: number;
  avgWaitTime: number;
  availableSlots: TimeSlot[];
  deviceCount: number;
}

export interface BranchStats {
  branchId: string;
  branchName: string;
  examCount: number;
  avgWaitTime: number;
  deviceUtilization: number;
  cancellationRate: number;
  revenue: number;
}

export interface OperationReport {
  id: string;
  month: string;
  branchStats: BranchStats[];
  totalExams: number;
  avgWaitTime: number;
  recheckRate: number;
  deviceFailures: number;
  totalRevenue: number;
  generatedAt: string;
}

export interface TechnicianRanking {
  technicianId: string;
  technicianName: string;
  avgScore: number;
  evaluationCount: number;
  examCount: number;
}

export interface MonthlyTrendData {
  month: string;
  examCount: number;
  revenue: number;
}

export interface RevenueDistribution {
  category: string;
  value: number;
}
