const MEDICATION_FORM_LABELS: Record<string, string> = {
  tablet: 'Viên nén',
  capsule: 'Viên nang',
  syrup: 'Siro',
  effervescent: 'Viên sủi',
  powder: 'Bột',
  injection: 'Tiêm',
  other: 'Khác',
};

const MEDICATION_USAGE_LABELS: Record<string, string> = {
  before_meal: 'Trước ăn',
  after_meal: 'Sau ăn',
  during_meal: 'Trong bữa ăn',
  before_sleep: 'Trước khi ngủ',
  as_directed: 'Theo chỉ định bác sĩ',
};

export function formatMedicationForm(value?: string | null) {
  if (!value?.trim()) return '';
  const key = value.trim();
  return MEDICATION_FORM_LABELS[key] ?? key;
}

export function formatMedicationUsage(value?: string | null) {
  if (!value?.trim()) return '';
  const key = value.trim();
  return MEDICATION_USAGE_LABELS[key] ?? key;
}
