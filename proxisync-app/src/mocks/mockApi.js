// ProxiSync Mock API Service
// Conforms to Section 6.1, 6.3, 8.4, 9.4
// Provides simulated latency (500ms) and programmatic failure injection

import { INITIAL_MOCK_DATA } from './mockData';

class MockApiService {
  constructor() {
    this.data = JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    this.currentUserId = null;
    this.simulatedFailureCode = null; // Set to reason code to trigger failure
    this.networkError = false;
  }

  setSimulatedFailure(code) {
    this.simulatedFailureCode = code;
  }

  getSimulatedFailure() {
    return this.simulatedFailureCode;
  }

  setNetworkError(enabled) {
    this.networkError = enabled;
  }

  async _delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async login(email, password) {
    await this._delay();
    if (this.networkError) throw new Error('Cannot reach server. Check your connection.');

    const user = this.data.users.find(
      u => u.email.toLowerCase() === (email || '').trim().toLowerCase() && u.password === password
    );

    if (!user) {
      const err = new Error('Wrong email or password');
      err.response = { status: 401, data: { error: 'Wrong email or password' } };
      throw err;
    }

    this.currentUserId = user.id;
    // Mock JWT containing role and user details
    const token = `mock-jwt-token-role-${user.role}-id-${user.id}`;
    return { token, role: user.role, id: user.id, name: user.name };
  }

  async register({ role, name, roll_no, email, password }) {
    await this._delay();
    if (this.networkError) throw new Error('Cannot reach server. Check your connection.');

    const exists = this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      const err = new Error('This email is already registered');
      err.response = { status: 400, data: { error: 'This email is already registered' } };
      throw err;
    }

    const id = this.data.users.length + 1;
    this.data.users.push({
      id,
      role,
      name,
      roll_no: role === 'student' ? roll_no : null,
      email,
      password,
    });

    return { id };
  }

  async getMe() {
    await this._delay(200);
    const user = this.data.users.find(u => u.id === this.currentUserId) || this.data.users[1]; // default student Aarav
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      roll_no: user.roll_no,
      email: user.email,
      streak: user.streak || 14,
    };
  }

  async getDeviceStatus() {
    await this._delay(250);
    const device = this.data.devices.find(d => d.user_id === this.currentUserId && d.status === 'active');
    return { registered: Boolean(device) };
  }

  async registerDevice(publicKeyPem) {
    await this._delay();
    if (!this.currentUserId) throw new Error('Unauthorized');

    const existing = this.data.devices.find(d => d.user_id === this.currentUserId && d.status === 'active');
    if (existing) {
      const err = new Error('A device is already registered. Ask your teacher to reset it.');
      err.response = { status: 409, data: { error: 'Device already bound' } };
      throw err;
    }

    this.data.devices.push({
      user_id: this.currentUserId,
      public_key: publicKeyPem,
      status: 'active',
      registered_at: new Date().toISOString(),
    });

    return { ok: true };
  }

  async resetStudentDevice(studentId) {
    await this._delay();
    const device = this.data.devices.find(d => d.user_id === studentId && d.status === 'active');
    if (device) {
      device.status = 'revoked';
    }
    return { ok: true };
  }

  async getCourses() {
    await this._delay(300);
    const user = this.data.users.find(u => u.id === this.currentUserId);
    if (user?.role === 'teacher') {
      return this.data.courses;
    }
    const enrolledIds = this.data.enrollments
      .filter(e => e.student_id === this.currentUserId)
      .map(e => e.course_id);
    return this.data.courses.filter(c => enrolledIds.includes(c.id));
  }

  async getRooms() {
    await this._delay(200);
    return this.data.rooms;
  }

  async getStudentsForCourse(courseId) {
    await this._delay(300);
    const studentIds = this.data.enrollments.filter(e => e.course_id === courseId).map(e => e.student_id);
    return this.data.users
      .filter(u => studentIds.includes(u.id))
      .map(u => ({ id: u.id, name: u.name, roll_no: u.roll_no }));
  }

  async getActiveSessions() {
    await this._delay(250);
    const now = new Date();
    const active = this.data.sessions.filter(s => !s.closed && new Date(s.ends_at) > now);
    return active.map(s => ({
      id: s.id,
      course_id: s.course_id,
      ends_at: s.ends_at,
      room_id: s.room_id,
    }));
  }

  async createSession(courseId, roomId, durationMinutes = 10) {
    await this._delay(400);
    const starts_at = new Date();
    const ends_at = new Date(starts_at.getTime() + durationMinutes * 60 * 1000);
    const id = 200 + this.data.sessions.length + 1;

    const newSession = {
      id,
      course_id: Number(courseId),
      teacher_id: this.currentUserId || 1,
      room_id: Number(roomId),
      secret: `session-secret-${id}`,
      starts_at: starts_at.toISOString(),
      ends_at: ends_at.toISOString(),
      closed: false,
    };

    this.data.sessions.push(newSession);
    return { id, ends_at: newSession.ends_at };
  }

  async getSessionToken(sessionId) {
    await this._delay(200);
    const session = this.data.sessions.find(s => s.id === sessionId);
    if (!session || session.closed || new Date() > new Date(session.ends_at)) {
      const err = new Error('Session not active');
      err.response = { status: 404 };
      throw err;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expires_in = 20 - (nowSeconds % 20);
    // Generate rotating token string
    const token = ((nowSeconds % 20000) * 48271 % 2147483647).toString(16).padEnd(12, 'a').slice(0, 12);
    return { token, expires_in };
  }

  async closeSession(sessionId) {
    await this._delay(300);
    const session = this.data.sessions.find(s => s.id === sessionId);
    if (session) {
      session.closed = true;
    }
    return { ok: true };
  }

  async submitAttendance({ session_id, token, ts, rssi_samples, signature }) {
    await this._delay(600);

    if (this.networkError) {
      return { ok: false, reason: 'NETWORK_ERROR' };
    }

    // Programmatic test failure injection (for test simulator checklist)
    if (this.simulatedFailureCode) {
      const code = this.simulatedFailureCode;
      return { ok: false, reason: code };
    }

    const session = this.data.sessions.find(s => s.id === session_id);
    if (!session || session.closed || new Date() > new Date(session.ends_at)) {
      return { ok: false, reason: 'SESSION_INACTIVE' };
    }

    const studentId = this.currentUserId || 2;
    const isEnrolled = this.data.enrollments.some(e => e.course_id === session.course_id && e.student_id === studentId);
    if (!isEnrolled) {
      return { ok: false, reason: 'NOT_ENROLLED' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - ts) > 30) {
      return { ok: false, reason: 'STALE_REQUEST' };
    }

    const device = this.data.devices.find(d => d.user_id === studentId && d.status === 'active');
    if (!device) {
      return { ok: false, reason: 'NO_DEVICE_BOUND' };
    }

    // Check RSSI samples
    const valid = (rssi_samples || []).filter(s => s <= 0 && s >= -110);
    if (valid.length < 3) {
      return { ok: false, reason: 'TOO_FAR' };
    }

    const sorted = [...valid].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const room = this.data.rooms.find(r => r.id === session.room_id) || { rssi_threshold: -75 };

    if (median < room.rssi_threshold) {
      return { ok: false, reason: 'TOO_FAR' };
    }

    const alreadyMarked = this.data.attendance.find(
      a => a.session_id === session_id && a.student_id === studentId && (a.status === 'present' || a.status === 'manual')
    );
    if (alreadyMarked) {
      return { ok: false, reason: 'ALREADY_MARKED' };
    }

    // Record attendance
    const student = this.data.users.find(u => u.id === studentId);
    this.data.attendance.unshift({
      id: this.data.attendance.length + 1,
      session_id,
      student_id: studentId,
      status: 'present',
      rssi_median: median,
      reject_reason: null,
      note: null,
      marked_at: new Date().toISOString(),
    });

    return { ok: true };
  }

  async getSessionAttendance(sessionId) {
    await this._delay(250);
    const list = this.data.attendance
      .filter(a => a.session_id === sessionId)
      .map(a => {
        const student = this.data.users.find(u => u.id === a.student_id) || {};
        return {
          student_id: a.student_id,
          name: student.name || 'Unknown Student',
          roll_no: student.roll_no || 'N/A',
          status: a.status,
          rssi_median: a.rssi_median,
          marked_at: a.marked_at,
          note: a.note,
        };
      })
      .sort((a, b) => new Date(b.marked_at) - new Date(a.marked_at));

    return list;
  }

  async manualAddAttendance(sessionId, studentId, note) {
    await this._delay(350);
    if (!note || note.trim().length === 0) {
      throw new Error('Note is required for manual attendance');
    }

    const existing = this.data.attendance.find(a => a.session_id === sessionId && a.student_id === studentId);
    if (existing) {
      existing.status = 'manual';
      existing.note = note;
      existing.marked_at = new Date().toISOString();
    } else {
      this.data.attendance.unshift({
        id: this.data.attendance.length + 1,
        session_id: sessionId,
        student_id: studentId,
        status: 'manual',
        rssi_median: -60,
        reject_reason: null,
        note,
        marked_at: new Date().toISOString(),
      });
    }

    return { ok: true };
  }

  async getCourseReportCsv(courseId) {
    await this._delay(400);
    const course = this.data.courses.find(c => c.id === courseId);
    const enrolledStudents = this.data.enrollments
      .filter(e => e.course_id === courseId)
      .map(e => this.data.users.find(u => u.id === e.student_id))
      .filter(Boolean);

    let csv = 'roll_no,name,attended,total,percent\n';
    enrolledStudents.forEach(st => {
      const attended = st.id === 2 ? 22 : st.id === 4 ? 24 : 15;
      const total = 26;
      const pct = ((attended / total) * 100).toFixed(1);
      csv += `${st.roll_no},${st.name},${attended},${total},${pct}\n`;
    });

    return csv;
  }

  async getMyAttendance() {
    await this._delay(350);
    return this.data.studentAttendanceStats;
  }

  // Student-loved features
  async getTodayTimetable() {
    await this._delay(200);
    return this.data.timetableToday;
  }

  async getBadges() {
    await this._delay(200);
    return this.data.badges;
  }

  async getNotificationSettings() {
    await this._delay(150);
    return this.data.notificationSettings;
  }

  async updateNotificationSettings(settings) {
    await this._delay(200);
    this.data.notificationSettings = { ...this.data.notificationSettings, ...settings };
    return this.data.notificationSettings;
  }
}

export const mockApi = new MockApiService();
