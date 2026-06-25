import { ForbiddenError } from '../error/error.js';

class PatientAccessService {
  constructor({ caregiverPatientRepository }) {
    this.caregiverPatientRepository = caregiverPatientRepository;
  }

  async assertCanAccessPatient({ userId, roleName, patientId }) {
    const normalizedPatientId = patientId?.toString?.() ?? patientId;

    if (roleName === 'admin') {
      return;
    }

    if (roleName === 'patient') {
      if (userId.toString() !== normalizedPatientId) {
        throw new ForbiddenError('Bạn không có quyền thao tác với bệnh nhân này');
      }
      return;
    }

    if (roleName === 'caregiver') {
      const mapping = await this.caregiverPatientRepository.findLinkedByCaregiverAndPatient({
        caregiverId: userId,
        patientId: normalizedPatientId,
      });
      if (!mapping) {
        throw new ForbiddenError('Bạn không có quyền thao tác với bệnh nhân này');
      }
      return;
    }

    throw new ForbiddenError();
  }
}

export default PatientAccessService;
