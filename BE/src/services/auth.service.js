import bcrypt from 'bcryptjs';
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
} from '../error/error.js';

const SALT_ROUNDS = 10;
const ALLOWED_LOGIN_ROLES = ['caregiver', 'admin'];

class AuthService {
  constructor({ userRepository, roleRepository, tokenService, caregiverPatientRepository }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.tokenService = tokenService;
    this.caregiverPatientRepository = caregiverPatientRepository;
  }

  #sanitizeUser(user) {
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
  }

  #getRoleName(user) {
    return user.roleId?.roleName || null;
  }

  async #issueTokens(user, deviceName = 'unknown', deviceId) {
    const roleName = this.#getRoleName(user);
    const tokens = await this.tokenService.generateAuthTokens({
      userId: user._id,
      name: user.name,
      roleId: user.roleId?._id || user.roleId,
      roleName,
      deviceId,
    });

    await this.tokenService.storeRefreshToken({
      userId: user._id,
      deviceId: tokens.deviceId,
      refreshToken: tokens.refreshToken,
      deviceName,
    });

    return tokens;
  }

  /** Chỉ caregiver được tự đăng ký */
  async registerCaregiver({ email, password, phone, name }) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const existingUser = await this.userRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new BadRequestError('Email đã tồn tại');
    }

    const existingUserByPhone = await this.userRepository.findUserByPhone(normalizedPhone);
    if (existingUserByPhone) {
      throw new BadRequestError('Số điện thoại đã tồn tại');
    }

    const caregiverRole = await this.roleRepository.findRoleByName('caregiver');
    if (!caregiverRole) {
      throw new BadRequestError('Role caregiver chưa được khởi tạo trong hệ thống');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await this.userRepository.createCaregiver({
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      name,
      roleId: caregiverRole._id,
    });

    return this.#sanitizeUser(newUser);
  }

  async loginUser({ email, phone, password, deviceName = 'unknown' }) {
    const user = email
      ? await this.userRepository.findUserByEmailWithPassword(email.toLowerCase().trim())
      : await this.userRepository.findUserByPhoneWithPassword(phone.trim());

    if (!user || !user.isActive) {
      throw new AuthenticationError('Email/SĐT hoặc mật khẩu không đúng');
    }

    const roleName = this.#getRoleName(user);
    if (!ALLOWED_LOGIN_ROLES.includes(roleName)) {
      throw new ForbiddenError('Tài khoản bệnh nhân vui lòng đăng nhập bằng mã PIN');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email/SĐT hoặc mật khẩu không đúng');
    }

    const tokens = await this.#issueTokens(user, deviceName);
    return {
      user: this.#sanitizeUser(user),
      ...tokens,
    };
  }

  async loginPatient({ caregiverPhone, authPin, deviceName = 'unknown' }) {
    const caregiver = await this.userRepository.findUserByPhoneWithPassword(caregiverPhone.trim());
    if (!caregiver || !caregiver.isActive) {
      throw new AuthenticationError('SĐT người thân hoặc mã PIN không đúng');
    }

    const caregiverRole = this.#getRoleName(caregiver);
    if (caregiverRole !== 'caregiver' && caregiverRole !== 'admin') {
      throw new AuthenticationError('SĐT người thân hoặc mã PIN không đúng');
    }

    const linkedMappings = await this.caregiverPatientRepository.findLinkedByCaregiverIdWithPin(caregiver._id);
    if (!linkedMappings.length) {
      throw new AuthenticationError('Người thân chưa liên kết bệnh nhân');
    }

    let matchedMapping = null;
    for (const mapping of linkedMappings) {
      const pinMatchesHash = await bcrypt.compare(authPin, mapping.authPin).catch(() => false);
      const pinMatchesLegacyRaw = mapping.authPin === authPin;
      if (pinMatchesHash || pinMatchesLegacyRaw) {
        matchedMapping = mapping;
        break;
      }
    }

    if (!matchedMapping?.patientId?._id) {
      throw new AuthenticationError('SĐT người thân hoặc mã PIN không đúng');
    }

    const patientUser = await this.userRepository.findUserById(matchedMapping.patientId._id);
    if (!patientUser || !patientUser.isActive) {
      throw new AuthenticationError('Bệnh nhân không tồn tại hoặc đã bị khóa');
    }

    const tokens = await this.#issueTokens(patientUser, deviceName);
    return {
      user: this.#sanitizeUser(patientUser),
      ...tokens,
    };
  }

  async getMyPatients({ caregiverId }) {
    const mappings = await this.caregiverPatientRepository.findLinkedByCaregiverId(caregiverId);
    return mappings
      .filter((mapping) => mapping.patientId)
      .map((mapping) => ({
        mappingId: mapping._id,
        linkedAt: mapping.linkedAt,
        patient: this.#sanitizeUser(mapping.patientId),
      }));
  }

  async createPatientForCaregiver({ caregiverId, name, authPin, birthday, gender }) {
    const caregiver = await this.userRepository.findUserById(caregiverId);
    if (!caregiver || !caregiver.isActive) {
      throw new AuthenticationError('Người thân không tồn tại hoặc đã bị khóa');
    }

    const caregiverRole = this.#getRoleName(caregiver);
    if (caregiverRole !== 'caregiver' && caregiverRole !== 'admin') {
      throw new ForbiddenError('Chỉ người thân chăm sóc mới có quyền tạo bệnh nhân');
    }

    const patientRole = await this.roleRepository.findRoleByName('patient');
    if (!patientRole) {
      throw new BadRequestError('Role patient chưa được khởi tạo trong hệ thống');
    }

    const patient = await this.userRepository.createPatient({
      name: name.trim(),
      roleId: patientRole._id,
      birthday: birthday ? new Date(birthday) : undefined,
      gender,
    });

    const hashedPin = await bcrypt.hash(authPin, SALT_ROUNDS);

    await this.caregiverPatientRepository.create({
      caregiverId: caregiver._id,
      patientId: patient._id,
      createdBy: caregiver._id,
      authPin: hashedPin,
    });

    return {
      patient: this.#sanitizeUser(patient),
      loginFields: {
        caregiverPhone: caregiver.phone,
        authPin,
      },
    };
  }

  async refreshUserToken({ refreshToken, deviceId, deviceName = 'unknown' }) {
    const decoded = await this.tokenService.verifyRefreshToken({ token: refreshToken });

    const user = await this.userRepository.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AuthenticationError('Người dùng không tồn tại');
    }

    const finalDeviceId = deviceId || decoded.deviceId;
    const revoked = await this.tokenService.revokeRefreshToken({
      userId: decoded.userId,
      deviceId: finalDeviceId,
    });

    if (!revoked) {
      throw new AuthenticationError('Refresh token không hợp lệ');
    }

    const tokens = await this.#issueTokens(user, deviceName, finalDeviceId);
    return tokens;
  }

  async logoutUser({ userId, deviceId }) {
    const revoked = await this.tokenService.revokeRefreshToken({ userId, deviceId });
    if (!revoked) {
      throw new AuthenticationError('Phiên đăng nhập không tồn tại hoặc đã hết hạn');
    }
    return { message: 'Đăng xuất thành công' };
  }
}

export default AuthService;
