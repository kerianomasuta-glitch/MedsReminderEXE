import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';

import { appointmentMock } from '@/constants/app-mock';

import { ActionButton, SectionCard, TextField } from './ui-kit';

type AppointmentFormProps = {
  mode: 'create' | 'edit';
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function AppointmentForm({ mode, onSubmit, onCancel }: AppointmentFormProps) {
  const sample = appointmentMock[0];
  const [hospital, setHospital] = useState(mode === 'edit' ? sample.hospital : '');
  const [department, setDepartment] = useState('Nội tim mạch');
  const [doctor, setDoctor] = useState(mode === 'edit' ? sample.doctor : '');
  const [date, setDate] = useState(mode === 'edit' ? sample.date : '2026-10-20');
  const [time, setTime] = useState(mode === 'edit' ? sample.time : '09:00 AM');
  const [address, setAddress] = useState(mode === 'edit' ? sample.address : '');
  const [note, setNote] = useState(mode === 'edit' ? sample.note : '');
  const [remindBefore, setRemindBefore] = useState('1 ngày');
  const [submitted, setSubmitted] = useState(false);

  const hospitalError = submitted && !hospital.trim() ? 'Vui lòng nhập bệnh viện/phòng khám.' : undefined;
  const dateError = submitted && !date.trim() ? 'Vui lòng nhập ngày khám.' : undefined;

  const handleSubmit = () => {
    setSubmitted(true);
    if (hospitalError || dateError) return;
    onSubmit?.();
  };

  return (
    <>
      <SectionCard>
        <TextField
          label="Tên bệnh viện / phòng khám"
          value={hospital}
          onChangeText={setHospital}
          placeholder="Bệnh viện ABC"
          error={hospitalError}
        />
        <TextField label="Khoa khám" value={department} onChangeText={setDepartment} />
        <TextField label="Tên bác sĩ" value={doctor} onChangeText={setDoctor} placeholder="BS. Nguyễn Văn B" />
        <TextField label="Ngày khám" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" error={dateError} />
        <TextField label="Giờ khám" value={time} onChangeText={setTime} placeholder="09:00 AM" />
        <TextField label="Địa chỉ" value={address} onChangeText={setAddress} />
        <TextField label="Ghi chú" value={note} onChangeText={setNote} multiline numberOfLines={4} style={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 10 }} />
        <TextField label="Nhắc trước" value={remindBefore} onChangeText={setRemindBefore} hint="1 giờ, 1 ngày, 3 ngày hoặc tùy chỉnh" />
      </SectionCard>

      <ActionButton
        label={mode === 'create' ? 'Lưu lịch khám' : 'Lưu thay đổi'}
        icon={<Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />}
        onPress={handleSubmit}
      />
      <ActionButton
        label="Hủy"
        tone="secondary"
        icon={<Ionicons name="close-circle-outline" size={18} color="#0F223D" />}
        onPress={onCancel}
      />
    </>
  );
}
