import {
  BadRequestError,
  NotFoundError,
} from '../error/error.js';

class ScheduleService {
  constructor({ scheduleRepository, userRepository, prescriptionRepository, patientAccessService }) {
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
    this.prescriptionRepository = prescriptionRepository;
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

  async #assertPrescriptionBelongsToPatient(prescriptionId, patientId) {
    const prescription = await this.prescriptionRepository.findById(prescriptionId);
    if (!prescription) {
      throw new BadRequestError('Đơn thuốc không tồn tại');
    }
    if (prescription.patientId.toString() !== patientId.toString()) {
      throw new BadRequestError('Đơn thuốc không thuộc bệnh nhân này');
    }
    return prescription;
  }

  async createSchedule({ actor, patientId, prescriptionId, createdBy, startDate, endDate, frequencyType, timeSlots, daysOfWeek, intervalDays, reminderMinutesBefore, timezone }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);
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

  async updateSchedule({ actor, id, data }) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }

    const patientId = data.patientId ?? schedule.patientId;
    const prescriptionId = data.prescriptionId ?? schedule.prescriptionId;
    const startDate = data.startDate ?? schedule.startDate;
    const endDate = data.endDate ?? schedule.endDate;

    await this.#assertAccess(actor, patientId);

    if (data.patientId) {
      await this.#assertPatientExists(patientId);
    }

    if (data.patientId || data.prescriptionId) {
      await this.#assertPrescriptionBelongsToPatient(prescriptionId, patientId);
    }

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestError('Ngày kết thúc phải sau ngày bắt đầu');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    return this.scheduleRepository.updateById(id, updateData);
  }

  async getSchedulesByPatient({ actor, patientId, limit, page }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);
    return this.scheduleRepository.findByPatientId({ patientId, limit, page });
  }

  async getScheduleById({ actor, id }) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    await this.#assertAccess(actor, schedule.patientId);
    return schedule;
  }

  async deleteSchedule({ actor, id }) {
    const schedule = await this.scheduleRepository.findById(id);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    await this.#assertAccess(actor, schedule.patientId);

    const deleted = await this.scheduleRepository.softDelete(id);
    return deleted;
  }
}

export default ScheduleService;
