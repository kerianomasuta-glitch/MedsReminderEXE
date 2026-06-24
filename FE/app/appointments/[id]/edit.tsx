import { router, useLocalSearchParams } from 'expo-router';

import { AppointmentForm, type AppointmentFormSubmitPayload } from '@/components/meds/appointment-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';
import { updateAppointment } from '@/store/appointments-store';

export default function EditAppointmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleSubmit = async (payload: AppointmentFormSubmitPayload) => {
    if (id) {
      updateAppointment(id, payload);
    }
    router.replace('/appointments');
  };

  return (
    <AppScreen>
      <PageHeader title="Chỉnh sửa lịch khám" subtitle="Cập nhật thông tin lịch khám và nhắc trước." />
      <AppointmentForm mode="edit" appointmentId={id} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </AppScreen>
  );
}
