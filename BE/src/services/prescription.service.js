import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../error/error.js';

class PrescriptionService {
  constructor({ prescriptionRepository, userRepository, medicationRepository, patientAccessService }) {
    this.prescriptionRepository = prescriptionRepository;
    this.userRepository = userRepository;
    this.medicationRepository = medicationRepository;
    this.patientAccessService = patientAccessService;
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

  async #assertAccess(actor, patientId) {
    await this.patientAccessService.assertCanAccessPatient({
      ...actor,
      patientId,
    });
  }

  async #assertMedicationsExist(medicationIds, patientId) {
    for (const medId of medicationIds) {
      const med = await this.medicationRepository.findById(medId);
      if (!med) {
        throw new BadRequestError(`Thuốc với id ${medId} không tồn tại`);
      }
      if (med.patientId.toString() !== patientId.toString()) {
        throw new BadRequestError(`Thuốc với id ${medId} không thuộc bệnh nhân này`);
      }
    }
  }

  async createPrescription({ actor, patientId, createdBy, title, medications, startDate, endDate, prescribedAt, doctorName, note }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);
    await this.#assertMedicationsExist(medications, patientId);

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

  async updatePrescription({ actor, id, data }) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }
    await this.#assertAccess(actor, prescription.patientId);

    if (data.medications) {
      await this.#assertMedicationsExist(data.medications, prescription.patientId);
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

  async getPrescriptionsByPatient({ actor, patientId, limit, page }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);
    return this.prescriptionRepository.findByPatientId({ patientId, limit, page });
  }

  async getPrescriptionById({ actor, id }) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }
    await this.#assertAccess(actor, prescription.patientId);
    return prescription;
  }

  async deletePrescription({ actor, id }) {
    const prescription = await this.prescriptionRepository.findById(id);
    if (!prescription) {
      throw new NotFoundError('Đơn thuốc không tồn tại');
    }
    await this.#assertAccess(actor, prescription.patientId);

    const deleted = await this.prescriptionRepository.softDelete(id);
    return deleted;
  }
}

export default PrescriptionService;
