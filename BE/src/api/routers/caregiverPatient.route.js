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
 *   get:
 *     tags: [Patient]
 *     summary: Danh sách bệnh nhân của caregiver
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 */
router.get(
  '/',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  async (req, res, next) => {
    const controller = req.container.resolve('caregiverPatientController');
    await controller.getMyPatients(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/patients:
 *   post:
 *     tags: [Patient]
 *     summary: Tạo hồ sơ bệnh nhân mới
 *     description: |
 *       Caregiver đã đăng nhập tạo bệnh nhân mới và liên kết với tài khoản của mình.
 *       Hệ thống tự tạo User (role patient) và CaregiverPatientMapping (kèm mã PIN hash).
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
 *       400:
 *         description: Dữ liệu không hợp lệ / PIN trùng
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 */
router.post(
  '/',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  validateData(createPatientSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('caregiverPatientController');
    await controller.createPatient(req, res, next);
  },
);

export default router;
