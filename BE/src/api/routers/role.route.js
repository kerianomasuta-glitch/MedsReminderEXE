import express from 'express';
import { createRoleSchema, updateRoleSchema } from '../../validators/role.validator.js';
import { validateData, authorizationByRole } from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Role
 *     description: Quản lý role (patient, caregiver, admin)
 */

/**
 * @openapi
 * /api/v1/roles:
 *   post:
 *     tags: [Role]
 *     summary: Tạo role mới
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName]
 *             properties:
 *               roleName:
 *                 type: string
 *                 enum: [patient, caregiver, admin]
 *                 example: caregiver
 *     responses:
 *       201:
 *         description: Tạo role thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Role created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Dữ liệu không hợp lệ / Role đã tồn tại
 */
router.post(
    '/',
    validateData(createRoleSchema),
    authorizationByRole(['admin']),
    async (req, res, next) => {
        const roleController = req.container.resolve('roleController');
        await roleController.createRole(req, res, next);
    }
);

/**
 * @openapi
 * /api/v1/roles:
 *   get:
 *     tags: [Role]
 *     summary: Lấy danh sách tất cả role
 *     security: []
 *     responses:
 *       200:
 *         description: Danh sách role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Roles fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 */
router.get(
    '/',
    async (req, res, next) => {
        const roleController = req.container.resolve('roleController');
        await roleController.getAllRoles(req, res, next);
    }
);

/**
 * @openapi
 * /api/v1/roles/{id}:
 *   put:
 *     tags: [Role]
 *     summary: Cập nhật role theo id
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ObjectId của role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName]
 *             properties:
 *               roleName:
 *                 type: string
 *                 enum: [patient, caregiver, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Cập nhật role thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Role updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Dữ liệu không hợp lệ / Role không tồn tại
 */
router.put(
    '/:id',
    validateData(updateRoleSchema),
    authorizationByRole(['admin']),
    async (req, res, next) => {
        const roleController = req.container.resolve('roleController');
        await roleController.updateRole(req, res, next);
    }
);

export default router;
