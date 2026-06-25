import Role from '../models/role.js';

class RoleRepository {
    findRoleByName = async (name) => {
        const existingRole = await Role.findOne({ roleName: name });
        if (!existingRole) {
            return null;
        }
        return existingRole;
    }

    findRoleById = async (id) => {
        const existingRole = await Role.findById(id);
        if (!existingRole) {
            return null;
        }
        return existingRole;
    }

    createRole = async ({ roleName }) => {
        const newRole = new Role({ roleName });
        const savedRole = await newRole.save();
        return savedRole;
    }

    updateRole = async ({ id, roleName }) => {
        const updatedRole = await Role.findByIdAndUpdate(id, { roleName }, { new: true });
        if (!updatedRole) {
            return null;
        }
        return updatedRole;
    }

    getAllRoles = async () => {
        const roles = await Role.find();
        return roles;
    }
}

export default RoleRepository;