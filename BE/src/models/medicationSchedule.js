import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },
    dosageNote: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    timeSlots: {
      type: [timeSlotSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: 'Cần ít nhất 1 khung giờ uống thuốc',
      },
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: (v) => v.every((d) => d >= 0 && d <= 6),
        message: 'daysOfWeek phải từ 0 (CN) đến 6 (T7)',
      },
    },
    intervalDays: {
      type: Number,
      min: [1, 'intervalDays phải >= 1'],
    },
    reminderMinutesBefore: {
      type: Number,
      default: 5,
      min: 0,
      max: 60,
    },
    timezone: {
      type: String,
      default: 'Asia/Ho_Chi_Minh',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

medicationScheduleSchema.index({ patientId: 1, isActive: 1 });
medicationScheduleSchema.index({ prescriptionId: 1, isActive: 1 });
medicationScheduleSchema.index({ 'timeSlots.time': 1, isActive: 1 });

export default mongoose.model('MedicationSchedule', medicationScheduleSchema);
