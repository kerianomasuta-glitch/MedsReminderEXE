import Joi from 'joi';

const phone = Joi.string()
  .trim()
  .pattern(/^0\d{9}$/)
  .messages({
    'string.pattern.base': 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)',
    'any.required': 'Số điện thoại là bắt buộc',
  });

const authPin = Joi.string()
  .trim()
  .pattern(/^\d{4}$/)
  .messages({
    'string.pattern.base': 'Mã PIN phải gồm đúng 4 chữ số',
    'any.required': 'Mã PIN là bắt buộc',
  });

const password = Joi.string()
  .min(6)
  .max(128)
  .messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc',
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

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'ID không hợp lệ',
  });

const patientProfileFields = {
  birthday: Joi.date().iso().max('now').messages({
    'date.max': 'Ngày sinh không hợp lệ',
  }),
  gender,
  conditions: Joi.array().items(Joi.string().trim().max(100)).max(20),
  allergies: Joi.string().trim().max(500).allow(''),
  emergencyContact: Joi.string().trim().max(100).allow(''),
  emergencyPhone: phone.allow(''),
  notes: Joi.string().trim().max(1000).allow(''),
};

/** Caregiver đăng ký tài khoản */
export const registerCaregiverSchema = Joi.object({
  name: name.required(),
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email là bắt buộc',
    'string.email': 'Email không hợp lệ',
  }),
  phone: phone.required(),
  password: password.required(),
});

/** Đăng ký user (chọn role theo roleId) */
export const registerUserSchema = Joi.object({
  name: name.required(),
  email: Joi.string().email().lowercase().trim().required().messages({
    'any.required': 'Email là bắt buộc',
    'string.email': 'Email không hợp lệ',
  }),
  phone: phone.required(),
  password: password.required(),
  roleId: objectId.required().messages({
    'any.required': 'roleId là bắt buộc',
  }),
  authPin: authPin.optional(),
  birthday: Joi.date().iso().max('now').optional().messages({
    'date.max': 'Ngày sinh không hợp lệ',
  }),
  gender: gender.optional(),
});

/** Caregiver đăng nhập (email hoặc SĐT + mật khẩu) */
export const loginCaregiverSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Email không hợp lệ',
  }),
  phone,
  password: password.required(),
})
  .xor('email', 'phone')
  .messages({
    'object.xor': 'Chỉ nhập email hoặc số điện thoại, không nhập cả hai',
    'object.missing': 'Cần email hoặc số điện thoại',
  });

/** Bệnh nhân đăng nhập: SĐT người thân + PIN */
export const loginPatientSchema = Joi.object({
  caregiverPhone: phone.required().messages({
    'any.required': 'Số điện thoại người thân là bắt buộc',
  }),
  authPin: authPin.required(),
});

/** Caregiver tạo hồ sơ bệnh nhân */
export const createPatientSchema = Joi.object({
  name: name.required(),
  authPin: authPin.required(),
  ...patientProfileFields,
});

/** Caregiver cập nhật hồ sơ bệnh nhân */
export const updatePatientSchema = Joi.object({
  name,
  authPin: authPin.optional(),
  ...patientProfileFields,
}).min(1).messages({
  'object.min': 'Cần ít nhất một trường để cập nhật',
});

/** Caregiver đăng nhập Google */
export const googleLoginSchema = Joi.object({
  idToken: Joi.string().trim().required().messages({
    'any.required': 'Google ID token là bắt buộc',
  }),
});

/** Bệnh nhân chấp nhận lời mời qua mã / QR */
export const acceptInviteSchema = Joi.object({
  inviteCode: Joi.string().trim().uppercase().required().messages({
    'any.required': 'Mã mời là bắt buộc',
  }),
});

/** Caregiver đổi mật khẩu */
export const changePasswordSchema = Joi.object({
  currentPassword: password.required().messages({
    'any.required': 'Mật khẩu hiện tại là bắt buộc',
  }),
  newPassword: password.required().messages({
    'any.required': 'Mật khẩu mới là bắt buộc',
  }),
}).custom((value, helpers) => {
  if (value.currentPassword === value.newPassword) {
    return helpers.error('any.invalid');
  }
  return value;
}).messages({
  'any.invalid': 'Mật khẩu mới phải khác mật khẩu hiện tại',
});
