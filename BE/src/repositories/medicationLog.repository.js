import MedicationLog from '../models/medicationLog.js';

class MedicationLogRepository {
  create = async (data) => {
    const log = new MedicationLog(data);
    await log.save();
    return log.populate(['scheduleId', 'prescriptionId']);
  };

  findById = async (id) =>
    MedicationLog.findById(id)
      .populate(['scheduleId', 'prescriptionId']);

  findByPatientId = async ({ patientId, limit = 20, page = 1, status }) => {
    const skip = (page - 1) * limit;
    const filter = { patientId };
    if (status) filter.status = status;

    const [logs, total] = await Promise.all([
      MedicationLog.find(filter)
        .populate(['scheduleId', 'prescriptionId'])
        .sort({ expectedTime: -1 })
        .skip(skip)
        .limit(limit),
      MedicationLog.countDocuments(filter),
    ]);

    return { logs, total };
  };

  findByScheduleId = async ({ scheduleId, limit = 50, page = 1 }) => {
    const skip = (page - 1) * limit;
    const filter = { scheduleId };

    const [logs, total] = await Promise.all([
      MedicationLog.find(filter)
        .sort({ expectedTime: -1 })
        .skip(skip)
        .limit(limit),
      MedicationLog.countDocuments(filter),
    ]);

    return { logs, total };
  };

  updateById = async (id, data) =>
    MedicationLog.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate(['scheduleId', 'prescriptionId']);
}

export default MedicationLogRepository;
