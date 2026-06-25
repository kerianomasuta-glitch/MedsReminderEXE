import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
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
    title: {
      type: String,
      trim: true,
      default: 'Đơn thuốc',
    },
    prescribedAt: {
      type: Date,
      default: Date.now,
    },
    startDate: Date,
    endDate: Date,
    doctorName: {
      type: String,
      trim: true,
    },
    note: String,
    medications: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medication',
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

prescriptionSchema.index({ patientId: 1, status: 1 });
prescriptionSchema.index({ patientId: 1, isActive: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
