import mongoose from 'mongoose';

const medicationScheduleSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    frequencyType: {
      type: String,
      enum: ['daily', 'weekly', 'interval', 'as_needed'],
      default: 'daily',
    },
    times: {
      type: [String],
      required: true,
    },
    daysOfWeek: {
      type: [Number],
    },
    intervalDays: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('MedicationSchedule', medicationScheduleSchema);
