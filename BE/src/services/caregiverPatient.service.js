import bcrypt from 'bcryptjs';
import { AuthenticationError, BadRequestError } from '../error/error.js';

const SALT_ROUNDS = 10;

class CaregiverPatientService {
  constructor({ caregiverPatientRepository, userRepository, roleRepository }) {
    this.caregiverPatientRepository = caregiverPatientRepository;
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
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

  async createPatient({ caregiverId, name, authPin, birthday, gender }) {
    const patientRole = await this.roleRepository.findRoleByName('patient');
    if (!patientRole) {
      throw new BadRequestError('Role patient chưa được khởi tạo trong hệ thống');
    }

    await this.#ensurePinUnique(caregiverId, authPin);

    const patient = await this.userRepository.createPatient({
      name,
      roleId: patientRole._id,
      birthday,
      gender,
    });

    const hashedPin = await bcrypt.hash(authPin, SALT_ROUNDS);

    const mapping = await this.caregiverPatientRepository.create({
      caregiverId,
      patientId: patient._id,
      createdBy: caregiverId,
      authPin: hashedPin,
    });

    const populated = await this.caregiverPatientRepository.findByIdWithPatient(mapping._id);
    return populated;
  }

  /** Xác thực SĐT caregiver + PIN, trả về User (patient) nếu hợp lệ */
  async authenticatePatient({ caregiverPhone, authPin }) {
    const caregiver = await this.userRepository.findUserByPhoneWithRole(caregiverPhone);
    if (!caregiver || caregiver.roleId?.roleName !== 'caregiver') {
      throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
    }

    const mappings = await this.caregiverPatientRepository
      .findLinkedByCaregiverIdWithPin(caregiver._id);

    if (!mappings.length) {
      throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
    }

    for (const mapping of mappings) {
      const isPinValid = await bcrypt.compare(authPin, mapping.authPin);
      if (isPinValid) {
        const patient = await this.userRepository.findUserById(mapping.patientId._id);
        if (!patient?.isActive) {
          throw new AuthenticationError('Tài khoản bệnh nhân đã bị vô hiệu hóa');
        }
        if (patient.roleId?.roleName !== 'patient') {
          throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
        }
        return patient;
      }
    }

    throw new AuthenticationError('Số điện thoại người thân hoặc mã PIN không đúng');
  }
}

export default CaregiverPatientService;
