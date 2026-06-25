import express from 'express';
import { createPatientSchema } from '../../validators/caregiverPatient.validator.js';
import {
  validateData,
  authentication,
  authorizationByRole,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Patient
 *     description: Caregiver quản lý hồ sơ bệnh nhân
 */

/**
 * @openapi
 * /api/v1/patients:
 *   post:
 *     tags: [Patient]
 *     summary: Tạo hồ sơ bệnh nhân mới
 *     description: |
 *       Caregiver đã đăng nhập tạo bệnh nhân mới và liên kết với tài khoản của mình.
 *       Hệ thống tự tạo User (role patient) và CaregiverPatientMapping (kèm mã PIN hash).
 *       Mã PIN dùng để bệnh nhân đăng nhập bằng SĐT của caregiver.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, authPin]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn Ba
 *               authPin:
 *                 type: string
 *                 description: Mã PIN 4 chữ số, unique trong phạm vi caregiver
 *                 example: "1234"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "1958-10-20"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *     responses:
 *       201:
 *         description: Tạo bệnh nhân thành công
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
 *                   example: Tạo hồ sơ bệnh nhân thành công
 *                 data:
 *                   $ref: '#/components/schemas/CaregiverPatientMapping'
 *       400:
 *         description: Dữ liệu không hợp lệ / PIN trùng / Role patient chưa khởi tạo
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Chỉ caregiver mới được tạo bệnh nhân
 */
router.post(
  '/',
  authentication,
  authorizationByRole(['caregiver']),
  validateData(createPatientSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('caregiverPatientController');
    await controller.createPatient(req, res, next);
  },
);

export default router;
