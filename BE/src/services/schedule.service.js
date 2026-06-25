import {
  BadRequestError,
  NotFoundError,
} from '../error/error.js';

class ScheduleService {
  constructor({ scheduleRepository, userRepository, prescriptionRepository }) {
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
    this.prescriptionRepository = prescriptionRepository;
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

  async #assertPrescriptionBelongsToPatient(prescriptionId, patientId) {
    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new BadRequestError('Đơn thuốc không tồn tại');
    }
    if (prescription.patientId.toString() !== patientId) {
      throw new BadRequestError('Đơn thuốc không thuộc bệnh nhân này');
    }
    return prescription;
  }

  async createSchedule({ patientId, prescriptionId, createdBy, startDate, endDate, frequencyType, timeSlots, daysOfWeek, intervalDays, reminderMinutesBefore, timezone }) {
    await this.#assertPatientExists(patientId);
    await this.#assertPrescriptionBelongsToPatient(prescriptionId, patientId);

    return this.scheduleRepository.create({
      patientId,
      prescriptionId,
      createdBy,
      startDate,
      endDate,
      frequencyType,
      timeSlots,
      daysOfWeek,
      intervalDays,
      reminderMinutesBefore,
      timezone,
    });
  }

  async updateSchedule({ id, data }) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    return this.scheduleRepository.updateById(id, data);
  }

  async getSchedulesByPatient({ patientId, limit, page }) {
    await this.#assertPatientExists(patientId);
    return this.scheduleRepository.findByPatientId({ patientId, limit, page });
  }

  async getScheduleById(id) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    return schedule;
  }

  async deleteSchedule(id) {
    const schedule = await this.scheduleRepository.softDelete(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    return schedule;
  }
}

export default ScheduleService;
