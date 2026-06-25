import Joi from 'joi';

const roleName = Joi.string()
  .trim()
  .lowercase()
  .valid('patient', 'caregiver', 'admin')
  .messages({
    'any.only': 'roleName phải là một trong: patient, caregiver, admin',
    'any.required': 'roleName là bắt buộc',
  });

export const createRoleSchema = Joi.object({
  roleName: roleName.required(),
});

export const updateRoleSchema = Joi.object({
  roleName: roleName.required(),
});
