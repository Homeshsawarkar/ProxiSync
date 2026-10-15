// ProxiSync Mock Service Layer
// Conforms strictly to PDF Sections 1.3, 5.2, 6.1, 6.2, 6.3 and 8.4
// Simulates 400-700ms network delay. State persisted in localStorage.

import { REASON_CODES } from '../utils/errors';

const DB_KEY = 'proxisync_mock_db_v1';

// Seed initial database
function getInitialDB() {
  return {
    users: [
      { id: 1, role: 'teacher', name: 'Dr. Arvind Sharma', email: 'sharma@college.edu', password: 'password123', roll_no: null },
      { id: 2, role: 'student', name: 'Aarav Patel', email: 'aarav@college.edu', password: 'password123', roll_no: '22AIML042', streak: 9 },
      { id: 3, role: 'student', name: 'Neha Rao', email: 'neha@college.edu', password: 'password123', roll_no: '22AIML018', streak: 14 },
      { id: 4, role: 'student', name: 'Rohan Deshmukh', email: 'rohan@college.edu', password: 'password123', roll_no: '22AIML055', streak: 3 },
      { id: 5, role: 'student', name: 'Priya Iyer', email: 'priya@college.edu', password: 'password123', roll_no: '22AIML009', streak: 21 }
    ],
    devices: [
      { user_id: 2, public_key: 'MOCK_KEY_AARAV_PEM', status: 'active' },
      { user_id: 3, public_key: 'MOCK_KEY_NEHA_PEM', status: 'active' },
      { user_id: 5, public_key: 'MOCK_KEY_PRIYA_PEM', status: 'active' }
      // Student 4 (Rohan) has no device registered yet -> shows Device Setup screen on login
    ],
    courses: [
      { id: 101, code: 'CS301', name: 'Machine Learning', division: 'AIML-A' },
      { id: 102, code: 'CS302', name: 'Deep Neural Networks', division: 'AIML-A' },
      { id: 103, code: 'CS303', name: 'Embedded IoT & Edge AI', division: 'AIML-A' }
    ],
    rooms: [
      { id: 1, name: 'LH-101 (Lecture Hall 1)', rssi_threshold: -75 },
      { id: 2, name: 'AI Lab 3 (Systems Lab)', rssi_threshold: -72 },
      { id: 3, name: 'Seminar Hall B', rssi_threshold: -78 }
    ],
    enrollments: [
      { course_id: 101, student_id: 2 },
      { course_id: 101, student_id: 3 },
      { course_id: 101, student_id: 4 },
      { course_id: 101, student_id: 5 },
      { course_id: 102, student_id: 2 },
      { course_id: 102, student_id: 3 },
      { course_id: 102, student_id: 4 },
      { course_id: 103, student_id: 2 },
      { course_id: 103, student_id: 5 }
    ],
    sessions: [], // { id, course_id, teacher_id, room_id, secret, starts_at, ends_at, closed }
    attendance: [
      // Seed historical attendance records for summary & percentage calculation
      // CS301 (Total: 28)
      ...Array.from({ length: 24 }).map((_, i) => ({ id: `hist_101_2_${i}`, session_id: 900 + i, course_id: 101, student_id: 2, status: 'present', marked_at: '2026-10-01' })),
      ...Array.from({ length: 26 }).map((_, i) => ({ id: `hist_101_3_${i}`, session_id: 900 + i, course_id: 101, student_id: 3, status: 'present', marked_at: '2026-10-01' })),
      ...Array.from({ length: 14 }).map((_, i) => ({ id: `hist_101_4_${i}`, session_id: 900 + i, course_id: 101, student_id: 4, status: 'present', marked_at: '2026-10-01' })), // 50% < 75% defaulter
      ...Array.from({ length: 27 }).map((_, i) => ({ id: `hist_101_5_${i}`, session_id: 900 + i, course_id: 101, student_id: 5, status: 'present', marked_at: '2026-10-01' })),
      // CS302 (Total: 22)
      ...Array.from({ length: 19 }).map((_, i) => ({ id: `hist_102_2_${i}`, session_id: 950 + i, course_id: 102, student_id: 2, status: 'present', marked_at: '2026-10-02' })),
      ...Array.from({ length: 21 }).map((_, i) => ({ id: `hist_102_3_${i}`, session_id: 950 + i, course_id: 102, student_id: 3, status: 'present', marked_at: '2026-10-02' })),
      ...Array.from({ length: 12 }).map((_, i) => ({ id: `hist_102_4_${i}`, session_id: 950 + i, course_id: 102, student_id: 4, status: 'present', marked_at: '2026-10-02' })),
      // CS303 (Total: 18)
      ...Array.from({ length: 15 }).map((_, i) => ({ id: `hist_103_2_${i}`, session_id: 980 + i, course_id: 103, student_id: 2, status: 'present', marked_at: '2026-10-03' })),
      ...Array.from({ length: 17 }).map((_, i) => ({ id: `hist_103_5_${i}`, session_id: 980 + i, course_id: 103, student_id: 5, status: 'present', marked_at: '2026-10-03' }))
    ]
  };
}

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const initial = getInitialDB();
      localStorage.setItem(DB_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return getInitialDB();
  }
}

function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Simulated network delay 400-700ms
const delay = (ms = 400 + Math.floor(Math.random() * 300)) =>
  new Promise((res) => setTimeout(res, ms));

// Simple deterministic hash for 20-second token generation
function generateRotatingToken(secret, timestampInSeconds) {
  const slot = Math.floor(timestampInSeconds / 20);
  let hash = 0;
  const str = `${secret}:${slot}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + 'a3f9').slice(0, 12);
}

export const mockApi = {
  // Reset database back to default seed
  async resetDatabase() {
    await delay(300);
    const initial = getInitialDB();
    saveDB(initial);
    return { ok: true };
  },

  // Auth: Login
  async login(email, password) {
    await delay();
    const db = loadDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      const err = new Error('Wrong email or password');
      err.status = 401;
      throw err;
    }
    const token = `jwt_mock_${user.id}_${Date.now()}`;
    return {
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        roll_no: user.roll_no,
        streak: user.streak || 5
      }
    };
  },

  // Auth: Register (PDF 8.1)
  async register({ role, name, roll_no, email, password }) {
    await delay();
    const db = loadDB();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      const err = new Error('This email is already registered');
      err.status = 409;
      throw err;
    }
    const newUser = {
      id: db.users.length + 1,
      role,
      name,
      roll_no: role === 'student' ? roll_no : null,
      email,
      password,
      streak: 1
    };
    db.users.push(newUser);
    saveDB(db);
    return { id: newUser.id };
  },

  // GET /me
  async getMe(userId) {
    await delay(200);
    const db = loadDB();
    const user = db.users.find(u => u.id === Number(userId));
    if (!user) throw new Error('User not found');
    return {
      id: user.id,
      role: user.role,
      name: user.name,
      roll_no: user.roll_no,
      email: user.email,
      streak: user.streak || 5
    };
  },

  // GET /me/device
  async getDeviceStatus(userId) {
    await delay(200);
    const db = loadDB();
    const device = db.devices.find(d => d.user_id === Number(userId) && d.status === 'active');
    return { registered: !!device };
  },

  // POST /devices/register
  async registerDevice(userId, publicKey = 'MOCK_PUBLIC_KEY_PEM') {
    await delay(500);
    const db = loadDB();
    const existing = db.devices.find(d => d.user_id === Number(userId) && d.status === 'active');
    if (existing) {
      const err = new Error('A device is already registered. Ask your teacher to reset it.');
      err.status = 409;
      throw err;
    }
    db.devices.push({
      user_id: Number(userId),
      public_key: publicKey,
      status: 'active'
    });
    saveDB(db);
    return { ok: true };
  },

  // POST /devices/reset/:studentId (Teacher reset)
  async resetDevice(studentId) {
    await delay();
    const db = loadDB();
    const device = db.devices.find(d => d.user_id === Number(studentId));
    if (device) {
      device.status = 'revoked';
      saveDB(db);
    }
    return { ok: true };
  },

  // GET /courses
  async getCourses(userId, role) {
    await delay();
    const db = loadDB();
    if (role === 'teacher') {
      return db.courses;
    }
    // Student enrolled courses
    const studentEnrollments = db.enrollments.filter(e => e.student_id === Number(userId));
    const courseIds = studentEnrollments.map(e => e.course_id);
    return db.courses.filter(c => courseIds.includes(c.id));
  },

  // GET /rooms
  async getRooms() {
    await delay(200);
    const db = loadDB();
    return db.rooms;
  },

  // GET /courses/:id/students
  async getCourseStudents(courseId) {
    await delay(200);
    const db = loadDB();
    const enrollments = db.enrollments.filter(e => e.course_id === Number(courseId));
    const studentIds = enrollments.map(e => e.student_id);
    return db.users
      .filter(u => studentIds.includes(u.id))
      .map(u => ({ id: u.id, name: u.name, roll_no: u.roll_no }));
  },

  // GET /sessions?status=active
  async getActiveSessions() {
    await delay(200);
    const db = loadDB();
    const now = Math.floor(Date.now() / 1000);
    return db.sessions.filter(s => !s.closed && s.ends_at > now);
  },

  // POST /sessions
  async startSession({ courseId, roomId, durationMinutes, teacherId }) {
    await delay();
    const db = loadDB();
    const starts_at = Math.floor(Date.now() / 1000);
    const ends_at = starts_at + (durationMinutes * 60);
    const session = {
      id: db.sessions.length + 1,
      course_id: Number(courseId),
      teacher_id: Number(teacherId),
      room_id: Number(roomId),
      secret: `sec_${courseId}_${roomId}_${Date.now()}`,
      starts_at,
      ends_at,
      duration_minutes: durationMinutes,
      closed: false
    };
    db.sessions.push(session);
    saveDB(db);
    return { id: session.id, ends_at: session.ends_at, session };
  },

  // GET /sessions/:id/token
  async getSessionToken(sessionId) {
    await delay(150);
    const db = loadDB();
    const session = db.sessions.find(s => s.id === Number(sessionId));
    const now = Math.floor(Date.now() / 1000);
    if (!session || session.closed || session.ends_at <= now) {
      const err = new Error('Session not active');
      err.status = 404;
      throw err;
    }
    const token = generateRotatingToken(session.secret, now);
    const secondsInSlot = now % 20;
    const expires_in = 20 - secondsInSlot;
    return { token, expires_in };
  },

  // POST /sessions/:id/close
  async closeSession(sessionId) {
    await delay();
    const db = loadDB();
    const session = db.sessions.find(s => s.id === Number(sessionId));
    if (session) {
      session.closed = true;
      saveDB(db);
    }
    return { ok: true };
  },

  // POST /attendance (THE 7 VALIDATION SHIELD CHECKS, Section 1.3 & 8.4)
  async submitAttendance({ sessionId, token, ts, rssi_samples, signature, studentId, demoOverrides = {} }) {
    await delay();
    const db = loadDB();
    const now = Math.floor(Date.now() / 1000);

    // DEMO OVERRIDE: Network failure
    if (demoOverrides.simulateNetworkError) {
      const err = new Error('Cannot reach server');
      err.reason = REASON_CODES.NETWORK_ERROR;
      throw err;
    }

    const session = db.sessions.find(s => s.id === Number(sessionId));
    const student = db.users.find(u => u.id === Number(studentId));

    // CHECK 1: Session exists, is not closed, and is inside its time window
    if (!session || session.closed || (session.ends_at <= now && !demoOverrides.forceSessionActive)) {
      return { ok: false, reason: REASON_CODES.SESSION_INACTIVE };
    }

    // CHECK 2: Student is enrolled in the session's course
    const isEnrolled = db.enrollments.some(e => e.course_id === session.course_id && e.student_id === Number(studentId));
    if (!isEnrolled || demoOverrides.forceNotEnrolled) {
      return { ok: false, reason: REASON_CODES.NOT_ENROLLED };
    }

    // CHECK 3: Request timestamp within 30 seconds of server time (anti-replay)
    const clientTs = Number(ts);
    const timeDiff = Math.abs(now - clientTs);
    if (timeDiff > 30 || demoOverrides.forceStaleRequest) {
      return { ok: false, reason: REASON_CODES.STALE_REQUEST };
    }

    // CHECK 4: Student has a bound device and signature matches
    const device = db.devices.find(d => d.user_id === Number(studentId) && d.status === 'active');
    if (!device || demoOverrides.forceNoDevice) {
      return { ok: false, reason: REASON_CODES.NO_DEVICE_BOUND };
    }
    if (demoOverrides.forceBadSignature || signature === 'INVALID_SIGNATURE') {
      return { ok: false, reason: REASON_CODES.BAD_SIGNATURE };
    }

    // CHECK 5: Rotating token matches current or previous 20-second slot
    const currentToken = generateRotatingToken(session.secret, now);
    const previousToken = generateRotatingToken(session.secret, now - 20);
    const isTokenValid = (token === currentToken || token === previousToken) && !demoOverrides.forceExpiredToken;
    if (!isTokenValid) {
      return { ok: false, reason: REASON_CODES.TOKEN_EXPIRED_OR_INVALID };
    }

    // CHECK 6: At least 3 RSSI samples and their median is above room threshold
    const room = db.rooms.find(r => r.id === session.room_id) || { rssi_threshold: -75 };
    const validSamples = (rssi_samples || []).filter(s => s <= 0 && s >= -110);
    if (validSamples.length < 3) {
      return { ok: false, reason: REASON_CODES.TOO_FAR };
    }
    const sorted = [...validSamples].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median < room.rssi_threshold || demoOverrides.forceTooFar) {
      return { ok: false, reason: REASON_CODES.TOO_FAR };
    }

    // CHECK 7: Student has not already been marked for this session
    const alreadyMarked = db.attendance.some(a => a.session_id === Number(sessionId) && a.student_id === Number(studentId) && (a.status === 'present' || a.status === 'manual'));
    if (alreadyMarked && !demoOverrides.forceBypassAlreadyMarked) {
      return { ok: false, reason: REASON_CODES.ALREADY_MARKED };
    }

    // ALL 7 CHECKS PASSED: Record attendance
    const record = {
      id: db.attendance.length + 1,
      session_id: Number(sessionId),
      course_id: session.course_id,
      student_id: Number(studentId),
      status: 'present',
      rssi_median: median,
      rssi_samples: validSamples,
      reject_reason: null,
      note: null,
      marked_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    db.attendance.push(record);
    saveDB(db);

    return {
      ok: true,
      data: {
        name: student.name,
        roll_no: student.roll_no,
        marked_at: record.marked_at,
        rssi_median: median,
        status: 'present'
      }
    };
  },

  // GET /sessions/:id/attendance (Teacher live list)
  async getSessionAttendance(sessionId) {
    await delay(200);
    const db = loadDB();
    const rows = db.attendance.filter(a => a.session_id === Number(sessionId) && (a.status === 'present' || a.status === 'manual'));
    return rows.map(r => {
      const student = db.users.find(u => u.id === r.student_id);
      return {
        id: r.id,
        student_id: r.student_id,
        name: student?.name || 'Unknown Student',
        roll_no: student?.roll_no || 'N/A',
        status: r.status,
        rssi_median: r.rssi_median,
        marked_at: r.marked_at,
        note: r.note
      };
    }).reverse(); // Newest at top
  },

  // POST /sessions/:id/manual (Teacher manual add)
  async manualAddAttendance({ sessionId, studentId, note }) {
    await delay();
    if (!note || note.trim().length === 0) {
      const err = new Error('Justification note is required');
      err.status = 400;
      throw err;
    }
    const db = loadDB();
    const session = db.sessions.find(s => s.id === Number(sessionId));
    const student = db.users.find(u => u.id === Number(studentId));
    if (!session || !student) throw new Error('Invalid session or student');

    const alreadyMarked = db.attendance.some(a => a.session_id === Number(sessionId) && a.student_id === Number(studentId));
    if (alreadyMarked) {
      throw new Error('Student is already marked present');
    }

    const record = {
      id: db.attendance.length + 1,
      session_id: Number(sessionId),
      course_id: session.course_id,
      student_id: Number(studentId),
      status: 'manual',
      rssi_median: null,
      rssi_samples: [],
      reject_reason: null,
      note: note.trim(),
      marked_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    db.attendance.push(record);
    saveDB(db);

    return {
      ok: true,
      data: {
        name: student.name,
        roll_no: student.roll_no,
        status: 'manual',
        marked_at: record.marked_at,
        note: record.note
      }
    };
  },

  // GET /me/attendance (Student attendance per course)
  async getStudentAttendance(studentId) {
    await delay();
    const db = loadDB();
    const enrolledCourses = await this.getCourses(studentId, 'student');

    return enrolledCourses.map(course => {
      // Find all sessions for this course
      const courseSessions = db.sessions.filter(s => s.course_id === course.id);
      const historyItems = db.attendance.filter(a => a.course_id === course.id);
      
      // Calculate total conducted sessions (or sample default base 28)
      const baseTotal = course.id === 101 ? 28 : (course.id === 102 ? 22 : 18);
      const totalSessions = Math.max(baseTotal, courseSessions.length);

      // Attended count
      const attendedCount = historyItems.filter(a => a.student_id === Number(studentId) && (a.status === 'present' || a.status === 'manual')).length;

      return {
        course: `${course.code} - ${course.name}`,
        course_id: course.id,
        code: course.code,
        name: course.name,
        total: Number(totalSessions),
        attended: Number(attendedCount)
      };
    });
  },

  // GET /reports/course/:id.csv (RFC 4180 CSV export)
  async getCourseReport(courseId) {
    await delay();
    const db = loadDB();
    const course = db.courses.find(c => c.id === Number(courseId));
    const students = await this.getCourseStudents(courseId);

    const baseTotal = courseId === 101 ? 28 : (courseId === 102 ? 22 : 18);

    const reportRows = students.map(student => {
      const attended = db.attendance.filter(a => a.course_id === Number(courseId) && a.student_id === student.id && (a.status === 'present' || a.status === 'manual')).length;
      const total = baseTotal;
      const percent = total > 0 ? Math.round((attended / total) * 100) : 0;
      return {
        roll_no: student.roll_no || 'N/A',
        name: student.name,
        attended,
        total,
        percent
      };
    });

    // Generate CSV text
    const headers = 'roll_no,name,attended,total,percent\n';
    const csvContent = reportRows.map(r => `"${r.roll_no}","${r.name}",${r.attended},${r.total},${r.percent}%`).join('\n');

    return {
      courseName: course?.name || 'Course',
      courseCode: course?.code || 'CS',
      rows: reportRows,
      csvText: headers + csvContent
    };
  }
};
