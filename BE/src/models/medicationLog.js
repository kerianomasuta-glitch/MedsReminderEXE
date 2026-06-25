import mongoose from 'mongoose';

const medicationLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicationSchedule',
      required: true,
      index: true,
    },
    medicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
    },
    expectedTime: {
      type: Date,
      required: true,
    },
    actualTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['taken', 'missed', 'late', 'skipped', 'pending'],
      default: 'pending',
    },
    skipReason: String,
    note: String,
  },
  { timestamps: true }
);

export default mongoose.model('MedicationLog', medicationLogSchema);
