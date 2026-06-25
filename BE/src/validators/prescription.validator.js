import Joi from 'joi';

const title = Joi.string().trim().min(1).max(200).messages({
  'any.required': 'Tiêu đề đơn thuốc là bắt buộc',
  'string.max': 'Tiêu đề không được quá 200 ký tự',
});

const medications = Joi.array()
  .items(Joi.string().trim())
  .min(1)
  .messages({
    'array.min': 'Đơn thuốc phải có ít nhất 1 loại thuốc',
    'any.required': 'Danh sách thuốc là bắt buộc',
  });

export const createPrescriptionSchema = Joi.object({
  patientId: Joi.string().trim().required().messages({
    'any.required': 'patientId là bắt buộc',
  }),
  title: title.optional(),
  medications: medications.required(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional().messages({
    'date.min': 'Ngày kết thúc phải sau ngày bắt đầu',
  }),
  prescribedAt: Joi.date().iso().optional(),
  doctorName: Joi.string().trim().max(200).optional(),
  note: Joi.string().trim().max(500).allow('').optional(),
});

export const updatePrescriptionSchema = Joi.object({
  title,
  medications: Joi.array().items(Joi.string().trim()).min(1).optional().messages({
    'array.min': 'Đơn thuốc phải có ít nhất 1 loại thuốc',
  }),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  prescribedAt: Joi.date().iso().optional(),
  doctorName: Joi.string().trim().max(200).optional(),
  note: Joi.string().trim().max(500).allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật',
});
