import bcrypt from 'bcryptjs';
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
} from '../error/error.js';

const SALT_ROUNDS = 10;
const ALLOWED_LOGIN_ROLES = ['caregiver', 'admin'];

class AuthService {
  constructor({ userRepository, roleRepository, tokenService, caregiverPatientService }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.tokenService = tokenService;
    this.caregiverPatientService = caregiverPatientService;
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
    const patient = await this.caregiverPatientService.authenticatePatient({
      caregiverPhone,
      authPin,
    });

    const tokens = await this.#issueTokens(patient, deviceName);
    return {
      user: this.#sanitizeUser(patient),
      ...tokens,
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
