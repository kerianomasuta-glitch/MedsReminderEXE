import { AuthenticationError, BadRequestError } from '../error/error.js';

class RoleService {
    constructor({ roleRepository }) {
        this.roleRepository = roleRepository;
    }

    async createRole({ roleName }) {
        const normalizedRoleName = roleName.toLowerCase().trim();
        const existingRole = await this.roleRepository.findRoleByName(normalizedRoleName);
        if (existingRole) {
            throw new BadRequestError('Role đã tồn tại');
        }
        const newRole = await this.roleRepository.createRole({ roleName: normalizedRoleName });
        return newRole;
    }

    async updateRole({ id, roleName }) {
        const normalizedRoleName = roleName.toLowerCase().trim();
        const existingRole = await this.roleRepository.findRoleById(id);
        if (!existingRole) {
            throw new BadRequestError('Role không tồn tại');
        }
        const updatedRole = await this.roleRepository.updateRole({ id, roleName: normalizedRoleName });
        return updatedRole;
    }

    async getAllRoles() {
        const roles = await this.roleRepository.getAllRoles();
        return roles;
    }
}

export default RoleService;