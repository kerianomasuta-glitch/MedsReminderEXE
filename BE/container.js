import { createContainer, asClass, asValue, Lifetime } from 'awilix';

// import controllers
import AuthController from './src/api/controllers/auth.controller.js';
import RoleController from './src/api/controllers/role.controller.js';
import CaregiverPatientController from './src/api/controllers/caregiverPatient.controller.js';
import MedicationController from './src/api/controllers/medication.controller.js';
import PrescriptionController from './src/api/controllers/prescription.controller.js';
import ScheduleController from './src/api/controllers/schedule.controller.js';
import MedicationLogController from './src/api/controllers/medicationLog.controller.js';
// import services
import authService from './src/services/auth.service.js';
import RoleService from './src/services/role.service.js';
import TokenService from './src/services/token.service.js';
import CaregiverPatientService from './src/services/caregiverPatient.service.js';
import MedicationService from './src/services/medication.service.js';
import PrescriptionService from './src/services/prescription.service.js';
import ScheduleService from './src/services/schedule.service.js';
import MedicationLogService from './src/services/medicationLog.service.js';
import PatientAccessService from './src/services/patientAccess.service.js';
// import repositories
import userRepository from './src/repositories/user.repository.js';
import CaregiverPatientRepository from './src/repositories/caregiverPatient.repository.js';
import RoleRepository from './src/repositories/role.repository.js';
import MedicationRepository from './src/repositories/medication.repository.js';
import PrescriptionRepository from './src/repositories/prescription.repository.js';
import ScheduleRepository from './src/repositories/schedule.repository.js';
import MedicationLogRepository from './src/repositories/medicationLog.repository.js';
// import infrastructure
import redisClient from './src/config/redis.js';

const container = createContainer();

export function setupContainer() {
  container.register({
    // controllers
    authController: asClass(AuthController).singleton(),
    roleController: asClass(RoleController).singleton(),
    caregiverPatientController: asClass(CaregiverPatientController).singleton(),
    medicationController: asClass(MedicationController).singleton(),
    prescriptionController: asClass(PrescriptionController).singleton(),
    scheduleController: asClass(ScheduleController).singleton(),
    medicationLogController: asClass(MedicationLogController).singleton(),
    // services
    authService: asClass(authService).singleton(),
    roleService: asClass(RoleService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    caregiverPatientService: asClass(CaregiverPatientService).singleton(),
    medicationService: asClass(MedicationService).singleton(),
    prescriptionService: asClass(PrescriptionService).singleton(),
    scheduleService: asClass(ScheduleService).singleton(),
    medicationLogService: asClass(MedicationLogService).singleton(),
    patientAccessService: asClass(PatientAccessService).singleton(),
    // repositories
    userRepository: asClass(userRepository).singleton(),
    caregiverPatientRepository: asClass(CaregiverPatientRepository).singleton(),
    roleRepository: asClass(RoleRepository).singleton(),
    medicationRepository: asClass(MedicationRepository).singleton(),
    prescriptionRepository: asClass(PrescriptionRepository).singleton(),
    scheduleRepository: asClass(ScheduleRepository).singleton(),
    medicationLogRepository: asClass(MedicationLogRepository).singleton(),
    // infrastructure
    redisClient: asValue(redisClient),
  });
}

setupContainer();

export default container;
