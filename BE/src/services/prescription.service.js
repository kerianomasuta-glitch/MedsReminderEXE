import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../error/error.js';

class PrescriptionService {
  constructor({ prescriptionRepository, userRepository, medicationRepository }) {
    this.prescriptionRepository = prescriptionRepository;
    this.userRepository = userRepository;
    this.medicationRepository = medicationRepository;
  }

  async #assertPatientExists(patientId) {
    const patient = await this.userRepository.findUserById(patientId);
    if (!patient || !patient.isActive) {
      throw new BadRequestError('Bệnh nhân không tồn tại');
    }
    if (patient.roleId?.roleName !== 'patient') {
      throw new BadRequestError('User này không phải bệnh nhân');
    }
    return patient;
  }

  async #assertMedicationsExist(medicationIds) {
    for (const medId of medicationIds) {
      const med = await this.medicationRepository.findById(medId);
      if (!med) {
        throw new BadRequestError(`Thuốc với id ${medId} không tồn tại`);
      }
    }
  }

  async createPrescription({ patientId, createdBy, title, medications, startDate, endDate, prescribedAt, doctorName, note }) {
    await this.#assertPatientExists(patientId);
    await this.#assertMedicationsExist(medications);

    if (title) {
      const existing = await this.prescriptionRepository.findByTitleAndPatient({
        title: title.trim(),
        patientId,
      });
      if (existing) {
        throw new ConflictError('Tên đơn thuốc đã tồn tại cho bệnh nhân này');
      }
    }

    return this.prescriptionRepository.create({
      patientId,
      createdBy,
      title: title?.trim() || 'Đơn thuốc',
      medications,
      startDate,
      endDate,
      prescribedAt,
      doctorName,
      note,
    });
  }

  async updatePrescription({ id, data }) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }

    if (data.medications) {
      await this.#assertMedicationsExist(data.medications);
    }

    if (data.title) {
      const existing = await this.prescriptionRepository.findByTitleAndPatient({
        title: data.title.trim(),
        patientId: prescription.patientId,
      });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Tên đơn thuốc đã tồn tại cho bệnh nhân này');
      }
      data.title = data.title.trim();
    }

    return this.prescriptionRepository.updateById(id, data);
  }

  async getPrescriptionsByPatient({ patientId, limit, page }) {
    await this.#assertPatientExists(patientId);
    return this.prescriptionRepository.findByPatientId({ patientId, limit, page });
  }

  async getPrescriptionById(id) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }
    return prescription;
  }

  async deletePrescription(id) {
    const prescription = await this.prescriptionRepository.softDelete(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }
    return prescription;
  }
}

export default PrescriptionService;
