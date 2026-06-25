import Joi from 'joi';

const authPin = Joi.string()
  .trim()
  .pattern(/^\d{4}$/)
  .messages({
    'string.pattern.base': 'Mã PIN phải gồm đúng 4 chữ số',
    'any.required': 'Mã PIN là bắt buộc',
  });

const name = Joi.string()
  .trim()
  .min(1)
  .max(100)
  .messages({
    'any.required': 'Họ tên là bắt buộc',
    'string.max': 'Họ tên không được quá 100 ký tự',
  });

const gender = Joi.string().valid('male', 'female', 'other');

/** Caregiver tạo hồ sơ bệnh nhân mới */
export const createPatientSchema = Joi.object({
  name: name.required(),
  authPin: authPin.required(),
  birthday: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Ngày sinh không hợp lệ',
  }),
  gender: gender.optional(),
});

/** Caregiver cập nhật hồ sơ bệnh nhân */
export const updatePatientSchema = Joi.object({
  name,
  authPin: authPin.optional(),
  birthday: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Ngày sinh không hợp lệ',
  }),
  gender: gender.optional(),
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật',
});
