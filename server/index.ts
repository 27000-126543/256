import express from 'express';
import cors from 'cors';
import { mockUsers, mockAppointments, mockReports, mockExamTypes, mockBranches, mockDevices, mockTimeSlots } from '../src/data/mockData';
import type { User, Appointment, Report, ExamType, HospitalBranch, Device, BranchRecommendation, TimeSlot } from '../src/types';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

interface LoginRequest {
  username: string;
  password: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
}

app.post('/api/auth/login', (req, res) => {
  const { username, password, role }: LoginRequest = req.body;

  const user = mockUsers.find(
    (u) => u.role === role && (u.phone === username || u.employeeId === username || u.name === username)
  );

  if (user && password === '123456') {
    const response: LoginResponse = {
      success: true,
      user,
      token: `mock-token-${user.id}-${Date.now()}`,
    };
    return res.json(response);
  }

  const response: LoginResponse = {
    success: false,
    message: '用户名或密码错误',
  };
  return res.status(401).json(response);
});

app.get('/api/appointments', (req, res) => {
  const { userId, role, patientId, doctorId } = req.query;

  let filteredAppointments = [...mockAppointments];

  if (role === 'patient' && userId) {
    filteredAppointments = filteredAppointments.filter((apt) => apt.patientId === userId);
  } else if (role === 'doctor' && userId) {
    filteredAppointments = filteredAppointments.filter((apt) => apt.doctorId === userId);
  } else if (patientId) {
    filteredAppointments = filteredAppointments.filter((apt) => apt.patientId === patientId);
  } else if (doctorId) {
    filteredAppointments = filteredAppointments.filter((apt) => apt.doctorId === doctorId);
  }

  res.json({
    success: true,
    data: filteredAppointments,
    total: filteredAppointments.length,
  });
});

app.get('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const appointment = mockAppointments.find((apt) => apt.id === id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: '预约不存在',
    });
  }

  res.json({
    success: true,
    data: appointment,
  });
});

app.post('/api/appointments', (req, res) => {
  const appointmentData = req.body;
  const newAppointment: Appointment = {
    ...appointmentData,
    id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    queuePosition: Math.floor(Math.random() * 10) + 1,
    estimatedWaitTime: Math.floor(Math.random() * 60) + 15,
  };

  mockAppointments.push(newAppointment);

  res.status(201).json({
    success: true,
    data: newAppointment,
    message: '预约创建成功',
  });
});

app.put('/api/appointments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, isUrgent } = req.body;

  const index = mockAppointments.findIndex((apt) => apt.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '预约不存在',
    });
  }

  if (status) {
    mockAppointments[index].status = status;
  }
  if (isUrgent !== undefined) {
    mockAppointments[index].isUrgent = isUrgent;
    if (isUrgent) {
      mockAppointments[index].status = 'urgent';
      mockAppointments[index].queuePosition = 1;
    }
  }

  res.json({
    success: true,
    data: mockAppointments[index],
    message: '预约状态更新成功',
  });
});

app.get('/api/reports', (req, res) => {
  const { appointmentId, technicianId, status } = req.query;

  let filteredReports = [...mockReports];

  if (appointmentId) {
    filteredReports = filteredReports.filter((r) => r.appointmentId === appointmentId);
  }
  if (technicianId) {
    filteredReports = filteredReports.filter((r) => r.technicianId === technicianId);
  }
  if (status) {
    filteredReports = filteredReports.filter((r) => r.status === status);
  }

  res.json({
    success: true,
    data: filteredReports,
    total: filteredReports.length,
  });
});

app.get('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const report = mockReports.find((r) => r.id === id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: '报告不存在',
    });
  }

  res.json({
    success: true,
    data: report,
  });
});

app.post('/api/reports', (req, res) => {
  const reportData = req.body;
  const newReport: Report = {
    ...reportData,
    id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: new Date().toISOString(),
  };

  mockReports.push(newReport);

  res.status(201).json({
    success: true,
    data: newReport,
    message: '报告创建成功',
  });
});

app.put('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, reviewerId, reviewerName, reviewComment } = req.body;

  const index = mockReports.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: '报告不存在',
    });
  }

  mockReports[index].status = status;
  if (reviewerId) mockReports[index].reviewerId = reviewerId;
  if (reviewerName) mockReports[index].reviewerName = reviewerName;
  if (reviewComment) mockReports[index].reviewComment = reviewComment;
  if (status === 'reviewed') {
    mockReports[index].reviewedAt = new Date().toISOString();
  }

  res.json({
    success: true,
    data: mockReports[index],
    message: '报告状态更新成功',
  });
});

app.get('/api/exam-types', (_req, res) => {
  res.json({
    success: true,
    data: mockExamTypes,
  });
});

app.get('/api/branches', (_req, res) => {
  res.json({
    success: true,
    data: mockBranches,
  });
});

app.get('/api/devices', (req, res) => {
  const { branchId, examTypeId } = req.query;

  let filteredDevices = [...mockDevices];

  if (branchId) {
    filteredDevices = filteredDevices.filter((d) => d.branchId === branchId);
  }
  if (examTypeId) {
    filteredDevices = filteredDevices.filter((d) => d.examTypeIds.includes(examTypeId as string));
  }

  res.json({
    success: true,
    data: filteredDevices,
  });
});

app.get('/api/recommendations', (req, res) => {
  const { examTypeId } = req.query;

  if (!examTypeId) {
    return res.status(400).json({
      success: false,
      message: '缺少检查类型参数',
    });
  }

  const examType = mockExamTypes.find((e) => e.id === examTypeId);
  if (!examType) {
    return res.status(404).json({
      success: false,
      message: '检查类型不存在',
    });
  }

  const devices = mockDevices.filter((d) => d.examTypeIds.includes(examTypeId as string));

  const recommendations: BranchRecommendation[] = mockBranches.map((branch) => {
    const branchDevices = devices.filter((d) => d.branchId === branch.id);

    if (branchDevices.length === 0) {
      return {
        branch,
        score: 0,
        avgWaitTime: 999,
        availableSlots: [],
        deviceCount: 0,
      };
    }

    const avgLoad = branchDevices.reduce((sum, d) => sum + d.currentLoad, 0) / branchDevices.length;
    const avgCapacity = branchDevices.reduce((sum, d) => sum + d.dailyCapacity, 0) / branchDevices.length;
    const utilization = avgLoad / avgCapacity;

    const queuePosition = Math.ceil(avgLoad / (branchDevices.length * 2));
    const avgWaitTime = queuePosition * examType.duration + Math.floor(Math.random() * 15);

    const busyDevices = branchDevices.filter((d) => d.status === 'busy').length;
    const maintenanceDevices = branchDevices.filter((d) => d.status === 'maintenance').length;

    let score = 100;
    score -= utilization * 25;
    score -= Math.min((avgWaitTime / 30) * 10, 25);
    score -= (busyDevices / branchDevices.length) * 10;
    score -= (maintenanceDevices / branchDevices.length) * 10;
    if (branch.distance) {
      score -= Math.min(branch.distance * 0.5, 8);
    }
    score += branchDevices.length * 3;
    score = Math.max(0, Math.round(score));

    const availableSlots: TimeSlot[] = mockTimeSlots.slice(0, 20).map((time) => {
      const random = Math.random();
      const isPeakHour = time.startsWith('09') || time.startsWith('10') || time.startsWith('14') || time.startsWith('15');
      const bookedProbability = isPeakHour ? 0.6 + utilization * 0.3 : 0.3 + utilization * 0.2;
      const booked = random > bookedProbability ? 0 : random > bookedProbability * 0.6 ? 1 : random > bookedProbability * 0.3 ? 2 : 3;
      return {
        time,
        available: booked < 3,
        capacity: 3,
        booked,
      };
    });

    return {
      branch,
      score,
      avgWaitTime,
      availableSlots,
      deviceCount: branchDevices.filter((d) => d.status !== 'maintenance').length,
    };
  });

  const validRecommendations = recommendations.filter((r) => r.deviceCount > 0);
  validRecommendations.sort((a, b) => b.score - a.score);

  res.json({
    success: true,
    data: validRecommendations.slice(0, 3),
    examType,
  });
});

app.get('/api/time-slots', (req, res) => {
  const { branchId, examTypeId, date } = req.query;

  const slots: TimeSlot[] = mockTimeSlots.map((time) => {
    const random = Math.random();
    const booked = random > 0.7 ? 3 : random > 0.4 ? 2 : random > 0.2 ? 1 : 0;
    return {
      time,
      available: booked < 3,
      capacity: 3,
      booked,
    };
  });

  res.json({
    success: true,
    data: slots,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${PORT}`);
  console.log(`📋 API接口列表:`);
  console.log(`   POST /api/auth/login - 用户登录`);
  console.log(`   GET  /api/appointments - 获取预约列表`);
  console.log(`   GET  /api/appointments/:id - 获取预约详情`);
  console.log(`   POST /api/appointments - 创建预约`);
  console.log(`   PUT  /api/appointments/:id/status - 更新预约状态`);
  console.log(`   GET  /api/reports - 获取报告列表`);
  console.log(`   GET  /api/reports/:id - 获取报告详情`);
  console.log(`   POST /api/reports - 创建报告`);
  console.log(`   PUT  /api/reports/:id/status - 更新报告状态`);
  console.log(`   GET  /api/exam-types - 获取检查类型`);
  console.log(`   GET  /api/branches - 获取院区列表`);
  console.log(`   GET  /api/devices - 获取设备列表`);
  console.log(`   GET  /api/recommendations - 智能院区推荐`);
  console.log(`   GET  /api/time-slots - 获取可用时间段`);
});

export default app;
