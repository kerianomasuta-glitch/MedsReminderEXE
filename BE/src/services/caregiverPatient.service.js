import bcrypt from 'bcryptjs';
import {
  AuthenticationError,
  BadRequestError,
  ForbiddenError,
} from '../error/error.js';

const SALT_ROUNDS = 10;

class CaregiverPatientService {
  constructor({ caregiverPatientRepository, userRepository, roleRepository }) {
    this.caregiverPatientRepository = caregiverPatientRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  #sanitizeUser(user) {
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
  }

  #getRoleName(user) {
    return user.roleId?.roleName || null;
  }

  async #assertCaregiverActive(caregiverId) {
    const caregiver = await this.userRepository.findUserById(caregiverId);
    if (!caregiver || !caregiver.isActive) {
      throw new AuthenticationError('Người thân không tồn tại hoặc đã bị khóa');
    }

    const roleName = this.#getRoleName(caregiver);
    if (roleName !== 'caregiver' && roleName !== 'admin') {
      throw new ForbiddenError('Chỉ người thân chăm sóc mới có quyền thực hiện thao tác này');
    }

    return caregiver;
  }

  async #ensurePinUnique(caregiverId, authPin) {
    const mappings = await this.caregiverPatientRepository
      .findLinkedByCaregiverIdWithPin(caregiverId);

    for (const mapping of mappings) {
      const isDuplicate = await bcrypt.compare(authPin, mapping.authPin);
      if (isDuplicate) {
        throw new BadRequestError('Mã PIN đã được sử dụng cho bệnh nhân khác');
      }
    }
  }

  async getMyPatients({ caregiverId }) {
    await this.#assertCaregiverActive(caregiverId);

    const mappings = await this.caregiverPatientRepository
      .findLinkedByCaregiverId(caregiverId);

    return mappings
      .filter((mapping) => mapping.patientId)
      .map((mapping) => ({
        mappingId: mapping._id,
        linkedAt: mapping.linkedAt,
        patient: this.#sanitizeUser(mapping.patientId),
      }));
  }

  async createPatient({ caregiverId, name, authPin, birthday, gender }) {
    const caregiver = await this.#assertCaregiverActive(caregiverId);

    const patientRole = await this.roleRepository.findRoleByName('patient');
    if (!patientRole) {
      throw new BadRequestError('Role patient chưa được khởi tạo trong hệ thống');
    }

    await this.#ensurePinUnique(caregiverId, authPin);

    const patient = await this.userRepository.createPatient({
      name: name.trim(),
      roleId: patientRole._id,
      birthday: birthday ? new Date(birthday) : undefined,
      gender,
    });

    const hashedPin = await bcrypt.hash(authPin, SALT_ROUNDS);

    await this.caregiverPatientRepository.create({
      caregiverId,
      patientId: patient._id,
      createdBy: caregiverId,
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

  /** Xác thực SĐT caregiver + PIN, trả về User (patient) nếu hợp lệ */
  async authenticatePatient({ caregiverPhone, authPin }) {
    const caregiver = await this.userRepository.findUserByPhoneWithRole(caregiverPhone.trim());
    if (!caregiver || !caregiver.isActive) {
      throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
    }

    const caregiverRole = this.#getRoleName(caregiver);
    if (caregiverRole !== 'caregiver' && caregiverRole !== 'admin') {
      throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
    }

    const mappings = await this.caregiverPatientRepository
      .findLinkedByCaregiverIdWithPin(caregiver._id);

    if (!mappings.length) {
      throw new AuthenticationError('Người thân chưa liên kết bệnh nhân');
    }

    for (const mapping of mappings) {
      const pinMatchesHash = await bcrypt.compare(authPin, mapping.authPin).catch(() => false);
      const pinMatchesLegacyRaw = mapping.authPin === authPin;
      if (!pinMatchesHash && !pinMatchesLegacyRaw) {
        continue;
      }

      const patient = await this.userRepository.findUserById(mapping.patientId._id);
      if (!patient?.isActive) {
        throw new AuthenticationError('Tài khoản bệnh nhân đã bị vô hiệu hóa');
      }
      if (patient.roleId?.roleName !== 'patient') {
        throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
      }
      return patient;
    }

    throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
  }
}

export default CaregiverPatientService;
