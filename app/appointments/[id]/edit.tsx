import { router } from 'expo-router';

import { AppointmentForm } from '@/components/meds/appointment-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';

export default function EditAppointmentScreen() {
  return (
    <AppScreen>
      <PageHeader title="Chỉnh sửa lịch khám" subtitle="Cập nhật thông tin lịch khám và nhắc trước." />
      <AppointmentForm mode="edit" onSubmit={() => router.back()} onCancel={() => router.back()} />
    </AppScreen>
  );
}
