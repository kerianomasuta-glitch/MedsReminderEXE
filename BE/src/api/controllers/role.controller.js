class RoleController {
    constructor({ roleService }) {
        this.roleService = roleService;
    }

    createRole = async (req, res, next) => {
        try {
            const { roleName } = req.body;
            const newRole = await this.roleService.createRole({ roleName });
            res.status(201).json({
                status: 'success',
                message: 'Role created successfully',
                data: newRole
            });
        }catch (error) {
            next(error);
        }
    }

    updateRole = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { roleName } = req.body;
            const updatedRole = await this.roleService.updateRole({ id, roleName });
            res.status(200).json({
                status: 'success',
                message: 'Role updated successfully',
                data: updatedRole
            });
        }catch (error) {
            next(error);
        }
    }

    getAllRoles = async (req, res, next) => {
        try {
            const roles = await this.roleService.getAllRoles();
            res.status(200).json({
                status: 'success',
                message: 'Roles fetched successfully',
                data: roles
            });
        }catch (error) {
            next(error);
        }
    }
}

export default RoleController;