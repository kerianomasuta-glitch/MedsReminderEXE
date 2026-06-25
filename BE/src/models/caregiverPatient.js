import mongoose from 'mongoose';

const caregiverPatientSchema = new mongoose.Schema(
  {
    caregiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'linked', 'rejected', 'removed'],
      default: 'pending',
    },
    permissions: {
      type: [String],
      enum: ['view_schedule', 'missed_alert', 'view_report'],
      default: ['view_schedule', 'missed_alert'],
    },
    inviteCode: String,
  },
  { timestamps: true }
);

caregiverPatientSchema.index({ caregiverId: 1, patientId: 1 }, { unique: true });

export default mongoose.model('CaregiverPatientMapping', caregiverPatientSchema);
