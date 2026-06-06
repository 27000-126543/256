import type {
  User,
  UserRole,
  Appointment,
  Report,
  ExamType,
  HospitalBranch,
  Device,
  BranchRecommendation,
  TimeSlot,
  AppointmentStatus,
  ReportStatus,
} from '../types';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.warn(`API调用失败 ${url}，使用Mock数据作为fallback:`, error);
    throw error;
  }
}

export const authApi = {
  async login(
    username: string,
    password: string,
    role: UserRole
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, role }),
      });

      if (response.data) {
        return response.data;
      }
      throw new Error(response.message || '登录失败');
    } catch (error) {
      throw error;
    }
  },
};

export const appointmentApi = {
  async getAppointments(params?: {
    userId?: string;
    role?: string;
    patientId?: string;
    doctorId?: string;
  }): Promise<Appointment[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.append('userId', params.userId);
      if (params?.role) searchParams.append('role', params.role);
      if (params?.patientId) searchParams.append('patientId', params.patientId);
      if (params?.doctorId) searchParams.append('doctorId', params.doctorId);

      const response = await request<Appointment[]>(
        `/appointments?${searchParams.toString()}`
      );
      return response.data || [];
    } catch (error) {
      console.warn('获取预约列表失败，返回空数组');
      return [];
    }
  },

  async getAppointmentById(id: string): Promise<Appointment | null> {
    try {
      const response = await request<Appointment>(`/appointments/${id}`);
      return response.data || null;
    } catch (error) {
      console.warn(`获取预约详情失败 ${id}`);
      return null;
    }
  },

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt' | 'queuePosition' | 'estimatedWaitTime'>
  ): Promise<Appointment | null> {
    try {
      const response = await request<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointment),
      });
      return response.data || null;
    } catch (error) {
      console.warn('创建预约失败');
      return null;
    }
  },

  async updateStatus(
    id: string,
    status?: AppointmentStatus,
    isUrgent?: boolean
  ): Promise<Appointment | null> {
    try {
      const response = await request<Appointment>(`/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, isUrgent }),
      });
      return response.data || null;
    } catch (error) {
      console.warn(`更新预约状态失败 ${id}`);
      return null;
    }
  },
};

export const reportApi = {
  async getReports(params?: {
    appointmentId?: string;
    technicianId?: string;
    status?: string;
  }): Promise<Report[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.appointmentId) searchParams.append('appointmentId', params.appointmentId);
      if (params?.technicianId) searchParams.append('technicianId', params.technicianId);
      if (params?.status) searchParams.append('status', params.status);

      const response = await request<Report[]>(
        `/reports?${searchParams.toString()}`
      );
      return response.data || [];
    } catch (error) {
      console.warn('获取报告列表失败，返回空数组');
      return [];
    }
  },

  async getReportById(id: string): Promise<Report | null> {
    try {
      const response = await request<Report>(`/reports/${id}`);
      return response.data || null;
    } catch (error) {
      console.warn(`获取报告详情失败 ${id}`);
      return null;
    }
  },

  async createReport(
    report: Omit<Report, 'id' | 'submittedAt'>
  ): Promise<Report | null> {
    try {
      const response = await request<Report>('/reports', {
        method: 'POST',
        body: JSON.stringify(report),
      });
      return response.data || null;
    } catch (error) {
      console.warn('创建报告失败');
      return null;
    }
  },

  async updateStatus(
    id: string,
    status: ReportStatus,
    reviewerId?: string,
    reviewerName?: string,
    reviewComment?: string
  ): Promise<Report | null> {
    try {
      const response = await request<Report>(`/reports/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, reviewerId, reviewerName, reviewComment }),
      });
      return response.data || null;
    } catch (error) {
      console.warn(`更新报告状态失败 ${id}`);
      return null;
    }
  },
};

export const examApi = {
  async getExamTypes(): Promise<ExamType[]> {
    try {
      const response = await request<ExamType[]>('/exam-types');
      return response.data || [];
    } catch (error) {
      console.warn('获取检查类型失败');
      return [];
    }
  },

  async getBranches(): Promise<HospitalBranch[]> {
    try {
      const response = await request<HospitalBranch[]>('/branches');
      return response.data || [];
    } catch (error) {
      console.warn('获取院区列表失败');
      return [];
    }
  },

  async getDevices(params?: {
    branchId?: string;
    examTypeId?: string;
  }): Promise<Device[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.branchId) searchParams.append('branchId', params.branchId);
      if (params?.examTypeId) searchParams.append('examTypeId', params.examTypeId);

      const response = await request<Device[]>(
        `/devices?${searchParams.toString()}`
      );
      return response.data || [];
    } catch (error) {
      console.warn('获取设备列表失败');
      return [];
    }
  },

  async getRecommendations(examTypeId: string): Promise<BranchRecommendation[]> {
    try {
      const response = await request<BranchRecommendation[]>(
        `/recommendations?examTypeId=${examTypeId}`
      );
      return response.data || [];
    } catch (error) {
      console.warn('获取推荐院区失败');
      return [];
    }
  },

  async getTimeSlots(params?: {
    branchId?: string;
    examTypeId?: string;
    date?: string;
  }): Promise<TimeSlot[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.branchId) searchParams.append('branchId', params.branchId);
      if (params?.examTypeId) searchParams.append('examTypeId', params.examTypeId);
      if (params?.date) searchParams.append('date', params.date);

      const response = await request<TimeSlot[]>(
        `/time-slots?${searchParams.toString()}`
      );
      return response.data || [];
    } catch (error) {
      console.warn('获取时间段失败');
      return [];
    }
  },
};
