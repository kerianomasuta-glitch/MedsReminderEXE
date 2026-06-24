export type UserRole = 'primary' | 'caregiver';
export type StatusTone = 'taken' | 'upcoming' | 'late' | 'missed' | 'pending';

export type MedicineMock = {
  id: string;
  name: string;
  form: string;
  dose: string;
  time: string;
  usageNote: string;
  status: StatusTone;
};

export const userMock = {
  name: 'MedsReminder User',
  age: 68,
  birthday: '1958-10-20',
  gender: 'Nữ',
  phone: '0909123456',
  email: 'meds.user@example.com',
  emergencyContact: 'Nguyễn Văn A',
  emergencyPhone: '0901234567',
  conditions: ['Huyết áp', 'Tiểu đường'],
  allergies: 'Dị ứng nhẹ với Penicillin',
  notes: 'Ưu tiên thuốc sau ăn, hạn chế thức ăn mặn.',
};

export const medicineMock: MedicineMock[] = [
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    form: 'Dạng sủi',
    dose: '1 viên',
    time: '07:00 AM',
    usageNote: 'Sau ăn',
    status: 'taken',
  },
  {
    id: 'bao-thanh',
    name: 'Siro ho Bảo Thanh',
    form: 'Dạng lỏng',
    dose: '10ml',
    time: '01:00 PM',
    usageNote: 'Theo chỉ định bác sĩ',
    status: 'upcoming',
  },
  {
    id: 'huyet-ap',
    name: 'Thuốc huyết áp',
    form: 'Viên nén',
    dose: '1 viên',
    time: '06:00 PM',
    usageNote: 'Sau ăn',
    status: 'missed',
  },
];

export const caregiverMock = [
  {
    id: 'caregiver-a',
    name: 'Nguyễn Văn A',
    contact: '0901234567',
    email: 'nguyenvana@example.com',
    status: 'Đã liên kết',
  },
  {
    id: 'caregiver-b',
    name: 'Trần Thu B',
    contact: '0919988776',
    email: 'tranthub@example.com',
    status: 'Đang chờ',
  },
];

export const appointmentMock = [
  {
    id: 'apt-huyet-ap',
    title: 'Tái khám huyết áp',
    hospital: 'Bệnh viện ABC',
    doctor: 'BS. Trần Minh',
    date: '20/10',
    time: '09:00 AM',
    address: '123 Nguyễn Huệ, Q1',
    note: 'Mang theo kết quả xét nghiệm gần nhất',
    status: 'Sắp tới',
  },
];

export const reportMock = {
  weeklyPercent: 85,
  onTime: 12,
  late: 2,
  missed: 1,
  timeline: [
    { time: '07:00', event: 'Vitamin C - Đã uống đúng giờ', tone: 'taken' as StatusTone },
    { time: '13:00', event: 'Siro ho - Trễ 10 phút', tone: 'late' as StatusTone },
    { time: '18:00', event: 'Thuốc huyết áp - Bỏ qua', tone: 'missed' as StatusTone },
  ],
};

export const reportChartValues = [70, 88, 80, 92, 76, 85, 81];

export const adminSummaryMock = {
  totalUsers: '1,240',
  activeSchedules: '3,981',
  todayAlerts: '73',
  supportNeededAccounts: '9',
};

export const adminUsersMock = [
  {
    id: 'u1',
    name: 'MedsReminder User',
    contact: 'meds.user@example.com',
    role: 'User',
    status: 'Active',
    createdAt: '2026-05-20',
  },
  {
    id: 'u2',
    name: 'Nguyễn Văn A',
    contact: '0901234567',
    role: 'Caregiver',
    status: 'Active',
    createdAt: '2026-05-18',
  },
  {
    id: 'u3',
    name: 'Trần B',
    contact: 'tranb@example.com',
    role: 'User',
    status: 'Need support',
    createdAt: '2026-05-11',
  },
];

export const aiQuickSymptoms = ['Đau đầu', 'Sốt', 'Ho', 'Đau bụng', 'Chóng mặt', 'Khó thở'];

export const aiResultMock = {
  summary: 'Mệt nhẹ, ho và khó chịu đường hô hấp trên.',
  possibleCause: 'Cảm lạnh/viêm họng do thay đổi thời tiết.',
  initialCare: 'Nghỉ ngơi, uống nước ấm, theo dõi nhiệt độ.',
  medicalVisitWhen: 'Kéo dài trên 3 ngày hoặc sốt cao liên tục.',
  dangerWarning: 'Khó thở, đau ngực, ngất, lơ mơ.',
};

export const healthOptions = ['Huyết áp', 'Tiểu đường', 'Tim mạch', 'Hen suyễn', 'Khác'];

export const profileMenuItems = [
  { label: 'Hồ sơ sức khỏe', icon: 'person-outline', route: '/profile-health', danger: false },
  { label: 'Quản lý lịch uống', icon: 'calendar-outline', route: '/schedule', danger: false },
  { label: 'Người thân theo dõi', icon: 'people-outline', route: '/caregivers', danger: false },
  { label: 'Lịch tái khám', icon: 'medkit-outline', route: '/appointments', danger: false },
  { label: 'Báo cáo tuân thủ', icon: 'stats-chart-outline', route: '/reports', danger: false },
  { label: 'Cài đặt thông báo', icon: 'notifications-outline', route: '/settings/notifications', danger: false },
  { label: 'Hỏi AI', icon: 'sparkles-outline', route: '/ai-assistant', danger: false },
  { label: 'Đăng xuất', icon: 'log-out-outline', route: '/login', danger: true },
] as const;

export const addMedicationTypeOptions = [
  { id: 'capsule', label: 'Viên nang', icon: 'medical' },
  { id: 'tablet', label: 'Viên nén', icon: 'square' },
  { id: 'syrup', label: 'Syrups', icon: 'water' },
  { id: 'other', label: 'Khác', icon: 'ellipsis-horizontal' },
] as const;

export const addMedicationNoteOptions = [
  { id: 'before', label: 'Trước bữa ăn' },
  { id: 'after', label: 'Sau bữa ăn' },
  { id: 'during', label: 'Trong khi ăn' },
] as const;

export const historyDateStripMock = ['12', '13', '14', '15', '16', '17', 'CN 18'];

export const reminderSkipReasons = ['Quên mang thuốc', 'Không muốn uống', 'Đã uống nhưng quên bấm', 'Khác'];

export const caregiverPermissionOptions = ['Xem lịch uống cơ bản', 'Nhận cảnh báo khi quên thuốc', 'Xem báo cáo tuân thủ'];

export const caregiverInviteMock = {
  inviteCode: 'MEDS-2026-8821',
  qrLabel: 'QR liên kết demo',
};

export const notificationCaregiverAlertOptions = ['15p', '30p', '60p'] as const;

export const missedAlertMock = {
  medicineName: 'Thuốc huyết áp',
  dueTime: '06:00 PM',
  lateDuration: '25 phút',
  caregiverNotice: 'Cảnh báo sẽ được gửi cho người thân sau 15 phút nếu bạn chưa xác nhận.',
};

export const medicineTypeOptions = [
  'Viên nén',
  'Viên nang',
  'Dạng lỏng',
  'Dạng sủi',
  'Bột',
  'Tiêm',
  'Khác',
] as const;

export const usageNoteOptions = [
  'Trước ăn',
  'Sau ăn',
  'Trong bữa ăn',
  'Trước khi ngủ',
  'Theo chỉ định bác sĩ',
] as const;

export const reminderIntervals = ['5p', '10p', '15p', '30p'] as const;
