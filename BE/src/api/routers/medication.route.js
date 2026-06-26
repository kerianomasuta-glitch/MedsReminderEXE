import express from 'express';
import {
  createMedicationSchema,
  updateMedicationSchema,
} from '../../validators/medication.validator.js';
import {
  validateData,
  authentication,
  authorizationByRole,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Medication
 *     description: Quản lý thuốc (kho thuốc của bệnh nhân)
 */

/**
 * @openapi
 * /api/v1/medications:
 *   post:
 *     tags: [Medication]
 *     summary: Tạo thuốc mới
 *     description: Caregiver/admin tạo một loại thuốc cho bệnh nhân.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, name, dosage]
 *             properties:
 *               patientId:
 *                 type: string
 *                 example: "64f000000000000000000002"
 *               name:
 *                 type: string
 *                 example: Paracetamol
 *               dosage:
 *                 type: string
 *                 example: "500mg"
 *               form:
 *                 type: string
 *                 enum: [tablet, capsule, syrup, effervescent, powder, injection, other]
 *                 example: tablet
 *               unit:
 *                 type: string
 *                 example: viên
 *               usageNote:
 *                 type: string
 *                 enum: [before_meal, after_meal, during_meal, before_sleep, as_directed]
 *                 example: after_meal
 *               description:
 *                 type: string
 *                 example: Thuốc giảm đau, hạ sốt
 *     responses:
 *       201:
 *         description: Tạo thuốc thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Bệnh nhân không tồn tại
 *       409:
 *         description: Thuốc đã tồn tại cho bệnh nhân
 */
router.post(
  '/',
  authentication,
  validateData(createMedicationSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('medicationController');
    await controller.createMedication(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medications/patient/{patientId}:
 *   get:
 *     tags: [Medication]
 *     summary: Danh sách thuốc của bệnh nhân
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
  async (req, res, next) => {
    const controller = req.container.resolve('medicationController');
    await controller.getMedicationsByPatient(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medications/{id}:
 *   get:
 *     tags: [Medication]
 *     summary: Lấy thông tin thuốc theo ID
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
 *         description: Thuốc không tồn tại
 */
router.get(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('medicationController');
    await controller.getMedicationById(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medications/{id}:
 *   put:
 *     tags: [Medication]
 *     summary: Cập nhật thuốc
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
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               form:
 *                 type: string
 *                 enum: [tablet, capsule, syrup, effervescent, powder, injection, other]
 *               unit:
 *                 type: string
 *               usageNote:
 *                 type: string
 *                 enum: [before_meal, after_meal, during_meal, before_sleep, as_directed]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Thuốc không tồn tại
 *       409:
 *         description: Tên thuốc trùng
 */
router.put(
  '/:id',
  authentication,
  validateData(updateMedicationSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('medicationController');
    await controller.updateMedication(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medications/{id}:
 *   delete:
 *     tags: [Medication]
 *     summary: Xóa thuốc (soft delete)
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
 *         description: Thuốc không tồn tại
 */
router.delete(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('medicationController');
    await controller.deleteMedication(req, res, next);
  },
);

export default router;
