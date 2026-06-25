import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../error/error.js';

class MedicationService {
  constructor({ medicationRepository, userRepository }) {
    this.medicationRepository = medicationRepository;
    this.userRepository = userRepository;
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

  async createMedication({ patientId, createdBy, name, form, dosage, unit, usageNote, description }) {
    await this.#assertPatientExists(patientId);

    const existing = await this.medicationRepository.findByNameAndPatient({
      name: name.trim(),
      patientId,
    });
    if (existing) {
      throw new ConflictError('Thuốc này đã tồn tại cho bệnh nhân');
    }

    return this.medicationRepository.create({
      patientId,
      createdBy,
      name: name.trim(),
      form,
      dosage,
      unit,
      usageNote,
      description,
    });
  }

  async updateMedication({ id, data }) {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundError('Thuốc không tồn tại');
    }

    if (data.name) {
      const existing = await this.medicationRepository.findByNameAndPatient({
        name: data.name.trim(),
        patientId: medication.patientId,
      });
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError('Tên thuốc đã tồn tại cho bệnh nhân này');
      }
      data.name = data.name.trim();
    }

    return this.medicationRepository.updateById(id, data);
  }

  async getMedicationsByPatient({ patientId, limit, page }) {
    await this.#assertPatientExists(patientId);
    return this.medicationRepository.findByPatientId({ patientId, limit, page });
  }

  async getMedicationById(id) {
    const medication = await this.medicationRepository.findById(id);
    if (!medication) {
      throw new NotFoundError('Thuốc không tồn tại');
    }
    return medication;
  }

  async deleteMedication(id) {
    const medication = await this.medicationRepository.softDelete(id);
    if (!medication) {
      throw new NotFoundError('Thuốc không tồn tại');
    }
    return medication;
  }
}

export default MedicationService;
