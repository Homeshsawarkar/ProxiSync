// Initial Mock Database State for ProxiSync
// Conforms to PDF Build Guide Section 5.2, 6.1, 6.3

export const INITIAL_MOCK_DATA = {
  users: [
    {
      id: 1,
      role: 'teacher',
      name: 'Dr. Arvind Sharma',
      email: 'sharma@college.edu',
      password: 'password123',
      roll_no: null,
      department: 'CSE (AI & ML)',
    },
    {
      id: 2,
      role: 'student',
      name: 'Aarav Patel',
      email: 'aarav@college.edu',
      password: 'password123',
      roll_no: '22AIML042',
      division: 'AIML-A',
      streak: 14,
    },
    {
      id: 3,
      role: 'student',
      name: 'Neha Rao',
      email: 'neha@college.edu',
      password: 'password123',
      roll_no: '22AIML018',
      division: 'AIML-A',
      streak: 9,
    },
    {
      id: 4,
      role: 'student',
      name: 'Rohan Deshmukh',
      email: 'rohan@college.edu',
      password: 'password123',
      roll_no: '22AIML055',
      division: 'AIML-A',
      streak: 21,
    },
    {
      id: 5,
      role: 'student',
      name: 'Priya Iyer',
      email: 'priya@college.edu',
      password: 'password123',
      roll_no: '22AIML009',
      division: 'AIML-A',
      streak: 6,
    },
    {
      id: 6,
      role: 'student',
      name: 'Kabir Verma',
      email: 'kabir@college.edu',
      password: 'password123',
      roll_no: '22AIML031',
      division: 'AIML-A',
      streak: 4,
    },
  ],

  // Device registration state: student 2 is registered; student 3 has no device registered yet (to test first-time forced setup)
  devices: [
    {
      user_id: 2,
      public_key: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEaaravDeviceSampleKey123...\n-----END PUBLIC KEY-----',
      status: 'active',
      registered_at: '2026-09-01T09:00:00Z',
    },
  ],

  courses: [
    { id: 101, code: 'CS301', name: 'Machine Learning', division: 'AIML-A', teacher_id: 1 },
    { id: 102, code: 'CS302', name: 'Deep Neural Networks', division: 'AIML-A', teacher_id: 1 },
    { id: 103, code: 'CS303', name: 'Embedded IoT & Edge AI', division: 'AIML-A', teacher_id: 1 },
    { id: 104, code: 'CS304', name: 'Cloud Computing & DevOps', division: 'AIML-A', teacher_id: 1 },
  ],

  rooms: [
    { id: 1, name: 'LH-101 (Lecture Hall 1)', rssi_threshold: -75 },
    { id: 2, name: 'AI Lab 3 (Systems Lab)', rssi_threshold: -72 },
    { id: 3, name: 'Seminar Hall B', rssi_threshold: -78 },
  ],

  enrollments: [
    { course_id: 101, student_id: 2 },
    { course_id: 101, student_id: 3 },
    { course_id: 101, student_id: 4 },
    { course_id: 101, student_id: 5 },
    { course_id: 101, student_id: 6 },
    { course_id: 102, student_id: 2 },
    { course_id: 102, student_id: 3 },
    { course_id: 102, student_id: 4 },
    { course_id: 103, student_id: 2 },
    { course_id: 103, student_id: 4 },
    { course_id: 104, student_id: 2 },
  ],

  sessions: [
    {
      id: 201,
      course_id: 101,
      teacher_id: 1,
      room_id: 1,
      secret: 'ml-session-secret-active',
      starts_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      closed: false,
    },
  ],

  attendance: [
    {
      id: 1,
      session_id: 201,
      student_id: 4,
      status: 'present',
      rssi_median: -63,
      reject_reason: null,
      note: null,
      marked_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      session_id: 201,
      student_id: 5,
      status: 'present',
      rssi_median: -59,
      reject_reason: null,
      note: null,
      marked_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    },
  ],

  // Student-loved mock additions (flagged for future backend API)
  timetableToday: [
    {
      id: 1,
      courseCode: 'CS301',
      courseName: 'Machine Learning',
      timeSlot: '09:00 - 10:00 AM',
      room: 'LH-101',
      teacher: 'Dr. Arvind Sharma',
      isLiveNow: true, // Active session right now!
      sessionId: 201,
    },
    {
      id: 2,
      courseCode: 'CS302',
      courseName: 'Deep Neural Networks',
      timeSlot: '11:15 - 12:15 PM',
      room: 'AI Lab 3',
      teacher: 'Dr. Arvind Sharma',
      isLiveNow: false,
      sessionId: null,
    },
    {
      id: 3,
      courseCode: 'CS303',
      courseName: 'Embedded IoT & Edge AI',
      timeSlot: '02:00 - 03:00 PM',
      room: 'LH-101',
      teacher: 'Prof. S. Kulkarni',
      isLiveNow: false,
      sessionId: null,
    },
  ],

  studentAttendanceStats: [
    { course: 'Machine Learning', code: 'CS301', attended: '22', total: '26' }, // 84.6% (Safe)
    { course: 'Deep Neural Networks', code: 'CS302', attended: '15', total: '24' }, // 62.5% (Danger <75%)
    { course: 'Embedded IoT & Edge AI', code: 'CS303', attended: '19', total: '20' }, // 95% (Safe)
    { course: 'Cloud Computing & DevOps', code: 'CS304', attended: '18', total: '24' }, // 75.0% (Edge)
  ],

  badges: [
    { id: 'streak_5', title: '5-Day Streak', desc: '5 consecutive classes attended', icon: 'zap', unlocked: true },
    { id: 'streak_10', title: '10-Day Streak', desc: '10 consecutive classes attended', icon: 'flame', unlocked: true },
    { id: 'streak_20', title: 'Punctuality Pro', desc: '20 consecutive classes attended', icon: 'award', unlocked: false },
    { id: 'safe_zone', title: 'High Flier', desc: 'Maintained ≥85% across all courses', icon: 'shield-check', unlocked: true },
  ],

  notificationSettings: {
    sessionOpenedPush: true,
    attendanceLowWarning: true,
    weeklyReport: true,
    hapticFeedback: true,
  },
};
