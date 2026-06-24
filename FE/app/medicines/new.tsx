import { router } from 'expo-router';

import { MedicineForm, type MedicineFormSubmitPayload } from '@/components/meds/medicine-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';
import { addMedicationSchedule } from '@/store/medication-schedule-store';

export default function NewMedicineScreen() {
  const handleSubmit = async (payload: MedicineFormSubmitPayload) => {
    addMedicationSchedule({
      name: payload.name,
      dose: payload.dose,
      formType: payload.formType,
      times: payload.times,
    });
    router.replace('/schedule');
  };

  return (
    <AppScreen paddedBottom={44}>
      <PageHeader title="Thêm thuốc mới" subtitle="Nhập thông tin thuốc và lịch uống để tạo nhắc nhở." />
      <MedicineForm mode="create" onSubmit={handleSubmit} onCancel={() => router.back()} />
    </AppScreen>
  );
}
