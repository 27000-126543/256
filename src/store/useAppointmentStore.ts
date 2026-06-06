import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, AppointmentStatus, BranchRecommendation, ExamType, HospitalBranch, TimeSlot } from '../types';
import { mockAppointments, mockExamTypes, mockBranches, mockDevices, mockTimeSlots } from '../data/mockData';

interface AppointmentState {
  appointments: Appointment[];
  examTypes: ExamType[];
  branches: HospitalBranch[];
  selectedExamType: ExamType | null;
  recommendations: BranchRecommendation[];
  setSelectedExamType: (examType: ExamType | null) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'queuePosition' | 'estimatedWaitTime'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  markAsUrgent: (id: string) => void;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getAppointmentsByTechnician: () => Appointment[];
  generateRecommendations: (examTypeId: string) => void;
  getAvailableTimeSlots: (branchId: string, examTypeId: string, date: string) => TimeSlot[];
  getAppointmentById: (id: string) => Appointment | undefined;
}

const generateId = () => `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,
      examTypes: mockExamTypes,
      branches: mockBranches,
      selectedExamType: null,
      recommendations: [],
      setSelectedExamType: (examType) => set({ selectedExamType: examType }),
      addAppointment: (appointmentData) => {
        const newAppointment: Appointment = {
          ...appointmentData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          queuePosition: Math.floor(Math.random() * 10) + 1,
          estimatedWaitTime: Math.floor(Math.random() * 60) + 15,
        };
        set((state) => ({
          appointments: [...state.appointments, newAppointment],
        }));
      },
      updateAppointmentStatus: (id, status) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, status } : apt
          ),
        }));
      },
      markAsUrgent: (id) => {
        set((state) => ({
          appointments: state.appointments.map((apt) =>
            apt.id === id ? { ...apt, isUrgent: true, status: 'urgent', queuePosition: 1 } : apt
          ),
        }));
      },
      getAppointmentsByPatient: (patientId) => {
        return get().appointments.filter((apt) => apt.patientId === patientId);
      },
      getAppointmentsByDoctor: (doctorId) => {
        return get().appointments.filter((apt) => apt.doctorId === doctorId);
      },
      getAppointmentsByTechnician: () => {
        return get().appointments.filter((apt) => apt.status === 'urgent' || apt.status === 'confirmed' || apt.status === 'processing');
      },
      generateRecommendations: (examTypeId) => {
        const branches = get().branches;
        const devices = mockDevices.filter((d) => d.examTypeIds.includes(examTypeId));
        
        const recommendations: BranchRecommendation[] = branches.map((branch) => {
          const branchDevices = devices.filter((d) => d.branchId === branch.id);
          const avgLoad = branchDevices.length > 0
            ? branchDevices.reduce((sum, d) => sum + d.currentLoad, 0) / branchDevices.length
            : 0;
          const utilization = branchDevices.length > 0
            ? branchDevices.reduce((sum, d) => sum + (d.currentLoad / d.dailyCapacity), 0) / branchDevices.length
            : 1;

          const waitTime = Math.floor(utilization * 60) + 10;
          const availableSlots = get().getAvailableTimeSlots(branch.id, examTypeId, new Date().toISOString().split('T')[0]);
          
          const score = Math.max(0, 100 - utilization * 50 - (waitTime / 2) + (branch.distance ? Math.max(0, 20 - branch.distance * 2) : 10));

          return {
            branch,
            score: Math.round(score),
            avgWaitTime: waitTime,
            availableSlots,
            deviceCount: branchDevices.length,
          };
        }).filter((r) => r.deviceCount > 0);

        recommendations.sort((a, b) => b.score - a.score);
        set({ recommendations: recommendations.slice(0, 3) });
      },
      getAvailableTimeSlots: (branchId, examTypeId, date) => {
        return mockTimeSlots.map((time) => {
          const booked = Math.floor(Math.random() * 3);
          const capacity = 3;
          return {
            time,
            available: booked < capacity,
            capacity,
            booked,
          };
        });
      },
      getAppointmentById: (id) => {
        return get().appointments.find((apt) => apt.id === id);
      },
    }),
    {
      name: 'appointment-storage',
    }
  )
);
