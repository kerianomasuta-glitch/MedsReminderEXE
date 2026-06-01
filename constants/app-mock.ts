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
