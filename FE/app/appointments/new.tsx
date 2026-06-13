import { router } from 'expo-router';

import { AppointmentForm } from '@/components/meds/appointment-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';

export default function NewAppointmentScreen() {
  return (
    <AppScreen>
      <PageHeader title="Thêm lịch khám" subtitle="Tạo lịch nhắc tái khám hoặc khám định kỳ." />
      <AppointmentForm mode="create" onSubmit={() => router.back()} onCancel={() => router.back()} />
    </AppScreen>
  );
}
