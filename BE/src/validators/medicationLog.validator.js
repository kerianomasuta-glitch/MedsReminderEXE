import Joi from 'joi';

export const createLogSchema = Joi.object({
  patientId: Joi.string().trim().required().messages({
    'any.required': 'patientId là bắt buộc',
  }),
  scheduleId: Joi.string().trim().required().messages({
    'any.required': 'scheduleId là bắt buộc',
  }),
  prescriptionId: Joi.string().trim().optional(),
  expectedTime: Joi.date().iso().required().messages({
    'any.required': 'expectedTime là bắt buộc',
  }),
});

export const updateLogStatusSchema = Joi.object({
  status: Joi.string()
    .valid('taken', 'missed', 'late', 'skipped')
    .required()
    .messages({
      'any.required': 'status là bắt buộc',
      'any.only': 'status phải là taken, missed, late hoặc skipped',
    }),
  actualTime: Joi.date().iso().optional(),
  skipReason: Joi.string().trim().max(500).optional()
    .when('status', {
      is: 'skipped',
      then: Joi.required().messages({ 'any.required': 'Cần ghi lý do khi bỏ qua' }),
    }),
  note: Joi.string().trim().max(500).allow('').optional(),
});
