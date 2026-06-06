import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login/Login';
import PatientHome from './pages/Patient/PatientHome';
import PatientAppointment from './pages/Patient/PatientAppointment';
import PatientAppointments from './pages/Patient/PatientAppointments';
import PatientReports from './pages/Patient/PatientReports';
import PatientEvaluate from './pages/Patient/PatientEvaluate';
import DoctorHome from './pages/Doctor/DoctorHome';
import DoctorAppointments from './pages/Doctor/DoctorAppointments';
import DoctorReports from './pages/Doctor/DoctorReports';
import TechnicianHome from './pages/Technician/TechnicianHome';
import TechnicianQueue from './pages/Technician/TechnicianQueue';
import TechnicianReport from './pages/Technician/TechnicianReport';
import DirectorHome from './pages/Director/DirectorHome';
import DirectorDevices from './pages/Director/DirectorDevices';
import DirectorCapacity from './pages/Director/DirectorCapacity';
import DirectorSatisfaction from './pages/Director/DirectorSatisfaction';
import AdminHome from './pages/Admin/AdminHome';
import AdminOverview from './pages/Admin/AdminOverview';
import AdminReports from './pages/Admin/AdminReports';
import AdminDistribution from './pages/Admin/AdminDistribution';
import Notifications from './pages/Notifications/Notifications';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/patient" replace />} />
          <Route path="notifications" element={<Notifications />} />

          <Route path="patient">
            <Route index element={<PatientHome />} />
            <Route path="appointment" element={<PatientAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="reports" element={<PatientReports />} />
            <Route path="evaluate" element={<PatientEvaluate />} />
          </Route>

          <Route path="doctor">
            <Route index element={<DoctorHome />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="reports" element={<DoctorReports />} />
          </Route>

          <Route path="technician">
            <Route index element={<TechnicianHome />} />
            <Route path="queue" element={<TechnicianQueue />} />
            <Route path="reports" element={<TechnicianReport />} />
          </Route>

          <Route path="director">
            <Route index element={<DirectorHome />} />
            <Route path="devices" element={<DirectorDevices />} />
            <Route path="capacity" element={<DirectorCapacity />} />
            <Route path="satisfaction" element={<DirectorSatisfaction />} />
          </Route>

          <Route path="admin">
            <Route index element={<AdminHome />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="distribution" element={<AdminDistribution />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
