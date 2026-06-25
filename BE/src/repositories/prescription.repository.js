import Prescription from '../models/prescription.js';

class PrescriptionRepository {
  create = async (data) => {
    const prescription = new Prescription(data);
    await prescription.save();
    return prescription.populate('medications');
  };

  findById = async (id) =>
    Prescription.findOne({ _id: id, isActive: true }).populate('medications');

  findByTitleAndPatient = async ({ title, patientId }) =>
    Prescription.findOne({
      title: { $regex: new RegExp(`^${title}$`, 'i') },
      patientId,
      isActive: true,
    });

  findByPatientId = async ({ patientId, limit = 20, page = 1 }) => {
    const skip = (page - 1) * limit;
    const filter = { patientId, isActive: true };

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .populate('medications')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prescription.countDocuments(filter),
    ]);

    return { prescriptions, total };
  };

  updateById = async (id, data) =>
    Prescription.findOneAndUpdate(
      { _id: id, isActive: true },
      data,
      { new: true, runValidators: true },
    ).populate('medications');

  softDelete = async (id) =>
    Prescription.findOneAndUpdate(
      { _id: id, isActive: true },
      { isActive: false },
      { new: true },
    );
}

export default PrescriptionRepository;
