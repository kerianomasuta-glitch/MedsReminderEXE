import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';

import { appointmentMock } from '@/constants/app-mock';
import { getAppointmentById } from '@/store/appointments-store';

import { ActionButton, SectionCard, TextField } from './ui-kit';

export type AppointmentFormSubmitPayload = {
  title: string;
  hospital: string;
  doctor: string;
  date: string;
  time: string;
  address: string;
  note: string;
};

type AppointmentFormProps = {
  mode: 'create' | 'edit';
  appointmentId?: string;
  onSubmit?: (payload: AppointmentFormSubmitPayload) => void | Promise<void>;
  onCancel?: () => void;
};

export function AppointmentForm({ mode, appointmentId, onSubmit, onCancel }: AppointmentFormProps) {
  const sample = (mode === 'edit' ? getAppointmentById(appointmentId) : undefined) ?? appointmentMock[0];
  const [title, setTitle] = useState(mode === 'edit' ? sample.title : '');
  const [hospital, setHospital] = useState(mode === 'edit' ? sample.hospital : '');
  const [department, setDepartment] = useState('Nội tim mạch');
  const [doctor, setDoctor] = useState(mode === 'edit' ? sample.doctor : '');
  const [date, setDate] = useState(mode === 'edit' ? sample.date : '2026-10-20');
  const [time, setTime] = useState(mode === 'edit' ? sample.time : '09:00 AM');
  const [address, setAddress] = useState(mode === 'edit' ? sample.address : '');
  const [note, setNote] = useState(mode === 'edit' ? sample.note : '');
  const [remindBefore, setRemindBefore] = useState('1 ngày');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleError = submitted && !title.trim() ? 'Vui lòng nhập tiêu đề lịch khám.' : undefined;
  const hospitalError = submitted && !hospital.trim() ? 'Vui lòng nhập bệnh viện/phòng khám.' : undefined;
  const dateError = submitted && !date.trim() ? 'Vui lòng nhập ngày khám.' : undefined;

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitted(true);
    if (titleError || hospitalError || dateError) return;
    setIsSubmitting(true);
    try {
      await onSubmit?.({
        title: title.trim(),
        hospital: hospital.trim(),
        doctor: doctor.trim(),
        date: date.trim(),
        time: time.trim(),
        address: address.trim(),
        note: note.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SectionCard>
        <TextField
          label="Tiêu đề lịch khám"
          value={title}
          onChangeText={setTitle}
          placeholder="Tái khám huyết áp"
          error={titleError}
        />
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
        <TextField
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={4}
          style={{ minHeight: 88, textAlignVertical: 'top', paddingTop: 10, borderWidth: 1 }}
        />
        <TextField label="Nhắc trước" value={remindBefore} onChangeText={setRemindBefore} hint="1 giờ, 1 ngày, 3 ngày hoặc tùy chỉnh" />
      </SectionCard>

      <ActionButton
        label={isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Lưu lịch khám' : 'Lưu thay đổi'}
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
