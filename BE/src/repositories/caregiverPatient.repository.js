import CaregiverPatient from '../models/caregiverPatient.js';

class CaregiverPatientRepository {
  create = async ({ caregiverId, patientId, createdBy, authPin }) =>
    CaregiverPatient.create({ caregiverId, patientId, createdBy, authPin });

  findByIdWithPatient = async (id) =>
    CaregiverPatient.findById(id).populate('patientId');

  findByCaregiverAndPatient = async ({ caregiverId, patientId }) =>
    CaregiverPatient.findOne({ caregiverId, patientId });

  findLinkedByCaregiverAndPatient = async ({ caregiverId, patientId }) =>
    CaregiverPatient.findOne({ caregiverId, patientId, status: 'linked' });

  findLinkedByCaregiverId = async (caregiverId) =>
    CaregiverPatient.find({ caregiverId, status: 'linked' }).populate('patientId');

  findLinkedByCaregiverIdWithPin = async (caregiverId) =>
    CaregiverPatient.find({ caregiverId, status: 'linked' })
      .select('+authPin')
      .populate('patientId');
}

export default CaregiverPatientRepository;
