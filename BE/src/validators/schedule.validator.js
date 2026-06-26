import Joi from 'joi';

const timeSlot = Joi.object({
  time: Joi.string()
    .trim()
    .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
    .required()
    .messages({
      'string.pattern.base': 'Giờ phải đúng định dạng HH:mm (00:00–23:59)',
      'any.required': 'Giờ uống là bắt buộc',
    }),
  dosageNote: Joi.string().trim().max(200).allow('').optional(),
});

export const createScheduleSchema = Joi.object({
  patientId: Joi.string().trim().required().messages({
    'any.required': 'patientId là bắt buộc',
  }),
  prescriptionId: Joi.string().trim().required().messages({
    'any.required': 'prescriptionId là bắt buộc',
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Ngày bắt đầu là bắt buộc',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'Ngày kết thúc phải sau ngày bắt đầu',
  }),
  frequencyType: Joi.string()
    .valid('daily', 'weekly', 'interval', 'as_needed')
    .optional(),
  timeSlots: Joi.array().items(timeSlot).min(1).required().messages({
    'array.min': 'Cần ít nhất 1 khung giờ uống thuốc',
    'any.required': 'timeSlots là bắt buộc',
  }),
  daysOfWeek: Joi.array()
    .items(Joi.number().integer().min(0).max(6))
    .optional()
    .when('frequencyType', {
      is: 'weekly',
      then: Joi.required().messages({ 'any.required': 'daysOfWeek bắt buộc khi frequencyType = weekly' }),
    }),
  intervalDays: Joi.number()
    .integer()
    .min(1)
    .optional()
    .when('frequencyType', {
      is: 'interval',
      then: Joi.required().messages({ 'any.required': 'intervalDays bắt buộc khi frequencyType = interval' }),
    }),
  reminderMinutesBefore: Joi.number().integer().min(0).max(60).optional(),
  timezone: Joi.string().trim().optional(),
});

export const updateScheduleSchema = Joi.object({
  patientId: Joi.string().trim().optional(),
  prescriptionId: Joi.string().trim().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  frequencyType: Joi.string()
    .valid('daily', 'weekly', 'interval', 'as_needed')
    .optional(),
  timeSlots: Joi.array().items(timeSlot).min(1).optional().messages({
    'array.min': 'Cần ít nhất 1 khung giờ uống thuốc',
  }),
  daysOfWeek: Joi.array()
    .items(Joi.number().integer().min(0).max(6))
    .optional()
    .when('frequencyType', {
      is: 'weekly',
      then: Joi.required().messages({ 'any.required': 'daysOfWeek bắt buộc khi frequencyType = weekly' }),
    }),
  intervalDays: Joi.number()
    .integer()
    .min(1)
    .optional()
    .when('frequencyType', {
      is: 'interval',
      then: Joi.required().messages({ 'any.required': 'intervalDays bắt buộc khi frequencyType = interval' }),
    }),
  reminderMinutesBefore: Joi.number().integer().min(0).max(60).optional(),
  timezone: Joi.string().trim().optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật',
});
