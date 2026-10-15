import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PhoneFrame } from './components/common/PhoneFrame';
import { SplashScreen } from './screens/auth/SplashScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { DeviceSetupScreen } from './screens/student/DeviceSetupScreen';
import { StudentHomeScreen } from './screens/student/StudentHomeScreen';
import { MarkAttendanceScreen } from './screens/student/MarkAttendanceScreen';
import { MyAttendanceScreen } from './screens/student/MyAttendanceScreen';
import { StudentSettingsScreen } from './screens/student/StudentSettingsScreen';
import { TeacherHomeScreen } from './screens/teacher/TeacherHomeScreen';
import { StartSessionScreen } from './screens/teacher/StartSessionScreen';
import { LiveSessionScreen } from './screens/teacher/LiveSessionScreen';
import { ReportsScreen } from './screens/teacher/ReportsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhoneFrame />}>
          <Route index element={<SplashScreen />} />
          <Route path="auth/login" element={<LoginScreen />} />
          <Route path="auth/register" element={<RegisterScreen />} />
          
          {/* Student Routes */}
          <Route path="student/setup" element={<DeviceSetupScreen />} />
          <Route path="student/home" element={<StudentHomeScreen />} />
          <Route path="student/mark" element={<MarkAttendanceScreen />} />
          <Route path="student/attendance" element={<MyAttendanceScreen />} />
          <Route path="student/settings" element={<StudentSettingsScreen />} />

          {/* Teacher Routes */}
          <Route path="teacher/home" element={<TeacherHomeScreen />} />
          <Route path="teacher/start" element={<StartSessionScreen />} />
          <Route path="teacher/live" element={<LiveSessionScreen />} />
          <Route path="teacher/reports" element={<ReportsScreen />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
