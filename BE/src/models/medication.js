import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'effervescent', 'powder', 'injection', 'other'],
      default: 'tablet',
    },
    dosage: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      default: 'viên',
    },
    usageNote: {
      type: String,
      enum: ['before_meal', 'after_meal', 'during_meal', 'before_sleep', 'as_directed'],
      default: 'after_meal',
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Medication', medicationSchema);
