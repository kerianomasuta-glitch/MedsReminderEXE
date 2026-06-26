import {
  BadRequestError,
  NotFoundError,
} from '../error/error.js';

const ALLOWED_TRANSITIONS = {
  pending: ['taken', 'missed', 'late', 'skipped'],
  missed: ['late', 'taken'],
};

class MedicationLogService {
  constructor({ medicationLogRepository, scheduleRepository, userRepository, patientAccessService }) {
    this.medicationLogRepository = medicationLogRepository;
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
    this.patientAccessService = patientAccessService;
  }

  async #assertPatientExists(patientId) {
    const patient = await this.userRepository.findUserById(patientId);
    if (!patient || !patient.isActive) {
      throw new BadRequestError('Bệnh nhân không tồn tại');
    }
    return patient;
  }

  async #assertAccess(actor, patientId) {
    await this.patientAccessService.assertCanAccessPatient({
      ...actor,
      patientId,
    });
  }

  async createLog({ actor, patientId, scheduleId, prescriptionId, expectedTime }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);

    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new BadRequestError('Lịch uống thuốc không tồn tại');
    }
    if (schedule.patientId.toString() !== patientId.toString()) {
      throw new BadRequestError('Lịch uống thuốc không thuộc bệnh nhân này');
    }

    return this.medicationLogRepository.create({
      patientId,
      scheduleId,
      prescriptionId: prescriptionId || schedule.prescriptionId,
      expectedTime,
    });
  }

  async updateLogStatus({ actor, id, status, actualTime, skipReason, note }) {
    const log = await this.medicationLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError('Bản ghi uống thuốc không tồn tại');
    }
    await this.#assertAccess(actor, log.patientId);

    const allowed = ALLOWED_TRANSITIONS[log.status];
    if (!allowed || !allowed.includes(status)) {
      throw new BadRequestError(
        `Không thể chuyển trạng thái từ "${log.status}" sang "${status}"`,
      );
    }

    if (status === 'skipped' && !skipReason) {
      throw new BadRequestError('Cần ghi lý do khi bỏ qua');
    }

    const updateData = { status };
    if (status === 'taken' || status === 'late') {
      updateData.actualTime = actualTime || new Date();
    }
    if (skipReason) updateData.skipReason = skipReason;
    if (note !== undefined) updateData.note = note;

    return this.medicationLogRepository.updateById(id, updateData);
  }

  async getLogsByPatient({ actor, patientId, limit, page, status }) {
    await this.#assertPatientExists(patientId);
    await this.#assertAccess(actor, patientId);
    return this.medicationLogRepository.findByPatientId({ patientId, limit, page, status });
  }

  async getLogsBySchedule({ actor, scheduleId, limit, page }) {
    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundError('Lịch uống thuốc không tồn tại');
    }
    await this.#assertAccess(actor, schedule.patientId);
    return this.medicationLogRepository.findByScheduleId({ scheduleId, limit, page });
  }

  async getLogById({ actor, id }) {
    const log = await this.medicationLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError('Bản ghi uống thuốc không tồn tại');
    }
    await this.#assertAccess(actor, log.patientId);
    return log;
  }
}

export default MedicationLogService;
