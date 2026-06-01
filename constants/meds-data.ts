export type MedicationStatus = 'taken' | 'upcoming' | 'late' | 'missed';

export type MedicationItem = {
  id: string;
  name: string;
  dose: string;
  time: string;
  icon: 'pill' | 'water' | 'medical';
  status: MedicationStatus;
  note?: string;
};

export const upcomingMedication = {
  id: 'paracetamol-500',
  name: 'Paracetamol 500mg',
  dose: '1 viên - Sau khi ăn',
  time: '08:00 AM',
  reminderIn: 'Trong 30 phút',
};

export const todayMedications: MedicationItem[] = [
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    dose: '1 viên - Dạng sủi',
    time: '07:00 AM',
    icon: 'medical',
    status: 'taken',
  },
  {
    id: 'bao-thanh-syrup',
    name: 'Siro ho Bảo Thanh',
    dose: '10ml - Dạng lỏng',
    time: '01:00 PM',
    icon: 'water',
    status: 'upcoming',
  },
  {
    id: 'huyet-ap',
    name: 'Thuốc huyết áp',
    dose: '1 viên - Bỏ lỡ',
    time: '06:00 PM',
    icon: 'pill',
    status: 'missed',
  },
];

export const historyScores = {
  onTime: 12,
  delayed: 2,
  skipped: 1,
  weeklyPercent: 85,
};

export const historyDetail: MedicationItem[] = [
  {
    id: 'amlodipine',
    name: 'Amlodipine (Huyết áp)',
    dose: '1 viên',
    time: '08:00 Sáng',
    icon: 'medical',
    status: 'taken',
  },
  {
    id: 'omega-3',
    name: 'Omega 3',
    dose: '1 viên',
    time: '01:00 Trưa',
    icon: 'pill',
    status: 'late',
  },
];

export const emergencyContacts = [
  {
    id: 'doctor',
    name: 'Bác sĩ riêng',
    role: 'Cardiologist - Dr. Nguyen',
  },
  {
    id: 'wife',
    name: 'Người thân (Vợ)',
    role: 'Primary Contact - Minh Ha',
  },
];
