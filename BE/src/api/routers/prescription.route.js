import express from 'express';
import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from '../../validators/prescription.validator.js';
import {
  validateData,
  authentication,
  authorizationByRole,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Prescription
 *     description: Quản lý đơn thuốc
 */

/**
 * @openapi
 * /api/v1/prescriptions:
 *   post:
 *     tags: [Prescription]
 *     summary: Tạo đơn thuốc
 *     description: Caregiver/admin tạo đơn thuốc cho bệnh nhân, chọn các thuốc (Medication) đã có.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, medications]
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "64f000000000000000000002"
 *               title:
 *                 type: string
 *                 example: Đơn huyết áp
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ObjectId của Medication
 *                 example: ["64f000000000000000000010", "64f000000000000000000011"]
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-25"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-25"
 *               prescribedAt:
 *                 type: string
 *                 format: date
 *               doctorName:
 *                 type: string
 *                 example: BS. Nguyễn Văn A
 *               note:
 *                 type: string
 *                 example: Uống sau ăn 30 phút
 *     responses:
 *       201:
 *         description: Tạo đơn thuốc thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Bệnh nhân hoặc thuốc không tồn tại
 *       409:
 *         description: Tên đơn thuốc trùng
 */
router.post(
  '/',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  validateData(createPrescriptionSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('prescriptionController');
    await controller.createPrescription(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/prescriptions/patient/{patientId}:
 *   get:
 *     tags: [Prescription]
 *     summary: Danh sách đơn thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lấy danh sách thành công
 *       400:
 *         description: Bệnh nhân không tồn tại
 */
router.get(
  '/patient/:patientId',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  async (req, res, next) => {
    const controller = req.container.resolve('prescriptionController');
    await controller.getPrescriptionsByPatient(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/prescriptions/{id}:
 *   get:
 *     tags: [Prescription]
 *     summary: Lấy chi tiết đơn thuốc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lấy thành công
 *       404:
 *         description: Đơn thuốc không tồn tại
 */
router.get(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('prescriptionController');
    await controller.getPrescriptionById(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/prescriptions/{id}:
 *   put:
 *     tags: [Prescription]
 *     summary: Cập nhật đơn thuốc
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               prescribedAt:
 *                 type: string
 *                 format: date
 *               doctorName:
 *                 type: string
 *               note:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Đơn thuốc không tồn tại
 *       409:
 *         description: Tên đơn thuốc trùng
 */
router.put(
  '/:id',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  validateData(updatePrescriptionSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('prescriptionController');
    await controller.updatePrescription(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/prescriptions/{id}:
 *   delete:
 *     tags: [Prescription]
 *     summary: Xóa đơn thuốc (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       404:
 *         description: Đơn thuốc không tồn tại
 */
router.delete(
  '/:id',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  async (req, res, next) => {
    const controller = req.container.resolve('prescriptionController');
    await controller.deletePrescription(req, res, next);
  },
);

export default router;
