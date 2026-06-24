import { router } from 'expo-router';

import { AppointmentForm, type AppointmentFormSubmitPayload } from '@/components/meds/appointment-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';
import { addAppointment } from '@/store/appointments-store';

export default function NewAppointmentScreen() {
  const handleSubmit = async (payload: AppointmentFormSubmitPayload) => {
    addAppointment(payload);
    router.replace('/appointments');
  };

  return (
    <AppScreen>
      <PageHeader title="Thêm lịch khám" subtitle="Tạo lịch nhắc tái khám hoặc khám định kỳ." />
      <AppointmentForm mode="create" onSubmit={handleSubmit} onCancel={() => router.back()} />
    </AppScreen>
  );
}
