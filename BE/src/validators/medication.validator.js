import Joi from 'joi';

const name = Joi.string().trim().min(1).max(200).messages({
  'any.required': 'Tên thuốc là bắt buộc',
  'string.max': 'Tên thuốc không được quá 200 ký tự',
});

const form = Joi.string().valid(
  'tablet', 'capsule', 'syrup', 'effervescent', 'powder', 'injection', 'other',
).messages({
  'any.only': 'Dạng thuốc không hợp lệ',
});

const dosage = Joi.string().trim().min(1).max(100).messages({
  'any.required': 'Liều dùng là bắt buộc',
  'string.max': 'Liều dùng không được quá 100 ký tự',
});

const unit = Joi.string().trim().max(50);

const usageNote = Joi.string().valid(
  'before_meal', 'after_meal', 'during_meal', 'before_sleep', 'as_directed',
).messages({
  'any.only': 'Hướng dẫn sử dụng không hợp lệ',
});

const description = Joi.string().trim().max(500).allow('');

export const createMedicationSchema = Joi.object({
  patientId: Joi.string().trim().required().messages({
    'any.required': 'patientId là bắt buộc',
  }),
  name: name.required(),
  dosage: dosage.required(),
  form: form.optional(),
  unit: unit.optional(),
  usageNote: usageNote.optional(),
  description: description.optional(),
});

export const updateMedicationSchema = Joi.object({
  name,
  dosage,
  form,
  unit,
  usageNote,
  description,
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật',
});
