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
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
      index: true,
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
  { timestamps: true },
);

medicationLogSchema.index({ patientId: 1, expectedTime: -1 });
medicationLogSchema.index({ scheduleId: 1, expectedTime: -1 });
medicationLogSchema.index({ patientId: 1, status: 1 });

export default mongoose.model('MedicationLog', medicationLogSchema);
