import { router } from 'expo-router';

import { MedicineForm } from '@/components/meds/medicine-form';
import { AppScreen, PageHeader } from '@/components/meds/ui-kit';

export default function NewMedicineScreen() {
  return (
    <AppScreen paddedBottom={44}>
      <PageHeader title="Thêm thuốc mới" />
      <MedicineForm mode="create" onSubmit={() => router.back()} onCancel={() => router.back()} />
    </AppScreen>
  );
}
