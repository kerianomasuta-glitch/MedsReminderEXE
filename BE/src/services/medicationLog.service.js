import {
  BadRequestError,
  NotFoundError,
} from '../error/error.js';

const ALLOWED_TRANSITIONS = {
  pending: ['taken', 'missed', 'late', 'skipped'],
  missed: ['late', 'taken'],
};

class MedicationLogService {
  constructor({ medicationLogRepository, scheduleRepository, userRepository }) {
    this.medicationLogRepository = medicationLogRepository;
    this.scheduleRepository = scheduleRepository;
    this.userRepository = userRepository;
  }

  async #assertPatientExists(patientId) {
    const patient = await this.userRepository.findUserById(patientId);
    if (!patient || !patient.isActive) {
      throw new BadRequestError('Bệnh nhân không tồn tại');
    }
    return patient;
  }

  async createLog({ patientId, scheduleId, prescriptionId, expectedTime }) {
    await this.#assertPatientExists(patientId);

    const schedule = await this.scheduleRepository.findById(scheduleId);
    if (!schedule) {
      throw new BadRequestError('Lịch uống thuốc không tồn tại');
    }

    return this.medicationLogRepository.create({
      patientId,
      scheduleId,
      prescriptionId: prescriptionId || schedule.prescriptionId,
      expectedTime,
    });
  }

  async updateLogStatus({ id, status, actualTime, skipReason, note }) {
    const log = await this.medicationLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError('Bản ghi uống thuốc không tồn tại');
    }

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

  async getLogsByPatient({ patientId, limit, page, status }) {
    await this.#assertPatientExists(patientId);
    return this.medicationLogRepository.findByPatientId({ patientId, limit, page, status });
  }

  async getLogsBySchedule({ scheduleId, limit, page }) {
    return this.medicationLogRepository.findByScheduleId({ scheduleId, limit, page });
  }

  async getLogById(id) {
    const log = await this.medicationLogRepository.findById(id);
    if (!log) {
      throw new NotFoundError('Bản ghi uống thuốc không tồn tại');
    }
    return log;
  }
}

export default MedicationLogService;
