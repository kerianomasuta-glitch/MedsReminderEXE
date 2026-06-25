import MedicationSchedule from '../models/medicationSchedule.js';

class ScheduleRepository {
  create = async (data) => {
    const schedule = new MedicationSchedule(data);
    await schedule.save();
    return schedule.populate('prescriptionId');
  };

  findById = async (id) =>
    MedicationSchedule.findOne({ _id: id, isActive: true })
      .populate('prescriptionId');

  findByPatientId = async ({ patientId, limit = 20, page = 1 }) => {
    const skip = (page - 1) * limit;
    const filter = { patientId, isActive: true };

    const [schedules, total] = await Promise.all([
      MedicationSchedule.find(filter)
        .populate('prescriptionId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MedicationSchedule.countDocuments(filter),
    ]);

    return { schedules, total };
  };

  findByPrescriptionId = async (prescriptionId) =>
    MedicationSchedule.find({ prescriptionId, isActive: true })
      .sort({ createdAt: -1 });

  updateById = async (id, data) =>
    MedicationSchedule.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { new: true, runValidators: true },
    ).populate('prescriptionId');

  softDelete = async (id) =>
    MedicationSchedule.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
}

export default ScheduleRepository;
