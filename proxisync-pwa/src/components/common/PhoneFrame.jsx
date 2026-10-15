import React, { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useSessionStore } from '../../stores/sessionStore';
import { Header } from './Header';
import { DemoControlsModal } from './DemoControlsModal';
import { Home, Radio, BarChart3, Settings, Users, BookOpen } from 'lucide-react';

export function PhoneFrame({ children }) {
  const { user, theme } = useAuthStore();
  const { activeSession, initActiveSession } = useSessionStore();
  const location = useLocation();

  useEffect(() => {
    initActiveSession();
  }, []);

  const isAuthPage = location.pathname.startsWith('/auth') || location.pathname === '/';
  const isDeviceSetup = location.pathname === '/student/setup';

  return (
    <div className={`app-backdrop ${theme}`}>
      <div className="phone-container">
        {!isAuthPage && !isDeviceSetup && <Header />}

        <main className="phone-screen-content">
          {children || <Outlet />}
        </main>

        {/* Student Bottom Navigation */}
        {user?.role === 'student' && !isDeviceSetup && (
          <nav className="bottom-nav">
            <NavLink to="/student/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Home size={20} />
              <span>Home</span>
            </NavLink>
            <NavLink to="/student/mark" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Radio size={20} />
              <span>Mark</span>
              {activeSession && <span className="nav-badge-dot" />}
            </NavLink>
            <NavLink to="/student/attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BarChart3 size={20} />
              <span>Stats</span>
            </NavLink>
            <NavLink to="/student/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </nav>
        )}

        {/* Teacher Bottom Navigation */}
        {user?.role === 'teacher' && (
          <nav className="bottom-nav">
            <NavLink to="/teacher/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BookOpen size={20} />
              <span>Courses</span>
            </NavLink>
            <NavLink to="/teacher/live" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Radio size={20} />
              <span>Live</span>
              {activeSession && <span className="nav-badge-dot" />}
            </NavLink>
            <NavLink to="/teacher/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} />
              <span>Reports</span>
            </NavLink>
          </nav>
        )}

        <DemoControlsModal />
      </div>
    </div>
  );
}
