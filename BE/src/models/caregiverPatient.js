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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authPin: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['pending', 'linked', 'rejected', 'removed'],
      default: 'linked',
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
    inviteCode: String,
    qrToken: {
      type: String,
      select: false,
    },
    qrExpiresAt: Date,
  },
  { timestamps: true }
);

caregiverPatientSchema.index({ caregiverId: 1, patientId: 1 }, { unique: true });
caregiverPatientSchema.index({ caregiverId: 1, status: 1 });
caregiverPatientSchema.index({ inviteCode: 1 }, { sparse: true, unique: true });
caregiverPatientSchema.index({ qrToken: 1 }, { sparse: true, unique: true });

export default mongoose.model('CaregiverPatientMapping', caregiverPatientSchema);
