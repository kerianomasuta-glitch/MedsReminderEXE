import Medication from '../models/medication.js';

class MedicationRepository {
  create = async (data) => {
    const medication = new Medication(data);
    await medication.save();
    return medication;
  };

  findById = async (id) =>
    Medication.findOne({ _id: id, isActive: true });

  findByNameAndPatient = async ({ name, patientId }) =>
    Medication.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      patientId,
      isActive: true,
    });

  findByPatientId = async ({ patientId, limit = 20, page = 1 }) => {
    const skip = (page - 1) * limit;
    const filter = { patientId, isActive: true };

    const [medications, total] = await Promise.all([
      Medication.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Medication.countDocuments(filter),
    ]);

    return { medications, total };
  };

  updateById = async (id, data) =>
    Medication.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { new: true, runValidators: true },
    );

  softDelete = async (id) =>
    Medication.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
}

export default MedicationRepository;
