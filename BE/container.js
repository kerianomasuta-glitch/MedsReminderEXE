import { createContainer, asClass, asValue, Lifetime } from 'awilix';

// import controllers
import AuthController from './src/api/controllers/auth.controller.js';
import RoleController from './src/api/controllers/role.controller.js';
import CaregiverPatientController from './src/api/controllers/caregiverPatient.controller.js';
// import services
import authService from './src/services/auth.service.js';
import RoleService from './src/services/role.service.js';
import TokenService from './src/services/token.service.js';
import CaregiverPatientService from './src/services/caregiverPatient.service.js';
// import repositories
import userRepository from './src/repositories/user.repository.js';
import CaregiverPatientRepository from './src/repositories/caregiverPatient.repository.js';
import RoleRepository from './src/repositories/role.repository.js';
// import infrastructure
import redisClient from './src/config/redis.js';

const container = createContainer();

export function setupContainer() {
  container.register({
    // controllers
    authController: asClass(AuthController).singleton(),
    roleController: asClass(RoleController).singleton(),
    caregiverPatientController: asClass(CaregiverPatientController).singleton(),
    // services
    authService: asClass(authService).singleton(),
    roleService: asClass(RoleService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    caregiverPatientService: asClass(CaregiverPatientService).singleton(),
    // repositories
    userRepository: asClass(userRepository).singleton(),
    caregiverPatientRepository: asClass(CaregiverPatientRepository).singleton(),
    roleRepository: asClass(RoleRepository).singleton(),
    // infrastructure
    redisClient: asValue(redisClient),
  });
}

setupContainer();

export default container;
