import express from 'express';
import {
  createLogSchema,
  updateLogStatusSchema,
} from '../../validators/medicationLog.validator.js';
import {
  validateData,
  authentication,
  authorizationByRole,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: MedicationLog
 *     description: Ghi nhận uống thuốc (taken / missed / skipped ...)
 */

/**
 * @openapi
 * /api/v1/medication-logs:
 *   post:
 *     tags: [MedicationLog]
 *     summary: Tạo bản ghi uống thuốc
 *     description: Hệ thống hoặc caregiver tạo 1 log khi đến giờ uống thuốc.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, scheduleId, expectedTime]
 *             properties:
 *               patientId:
 *                 type: string
 *               scheduleId:
 *                 type: string
 *               prescriptionId:
 *                 type: string
 *                 description: Nếu không truyền sẽ lấy từ schedule
 *               expectedTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-25T08:00:00Z"
 *     responses:
 *       201:
 *         description: Tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post(
  '/',
  authentication,
  authorizationByRole(['caregiver', 'admin']),
  validateData(createLogSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('medicationLogController');
    await controller.createLog(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medication-logs/patient/{patientId}:
 *   get:
 *     tags: [MedicationLog]
 *     summary: Danh sách bản ghi uống thuốc của bệnh nhân
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [taken, missed, late, skipped, pending]
 *         description: Lọc theo trạng thái
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
 *         description: Danh sách bản ghi
 */
router.get(
  '/patient/:patientId',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('medicationLogController');
    await controller.getLogsByPatient(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medication-logs/schedule/{scheduleId}:
 *   get:
 *     tags: [MedicationLog]
 *     summary: Danh sách bản ghi theo lịch uống
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: scheduleId
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
 *           default: 50
 *     responses:
 *       200:
 *         description: Danh sách bản ghi
 */
router.get(
  '/schedule/:scheduleId',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('medicationLogController');
    await controller.getLogsBySchedule(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medication-logs/{id}:
 *   get:
 *     tags: [MedicationLog]
 *     summary: Chi tiết bản ghi uống thuốc
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
 *         description: Chi tiết bản ghi
 *       404:
 *         description: Bản ghi không tồn tại
 */
router.get(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('medicationLogController');
    await controller.getLogById(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/medication-logs/{id}/status:
 *   patch:
 *     tags: [MedicationLog]
 *     summary: Cập nhật trạng thái uống thuốc
 *     description: |
 *       Chuyển trạng thái: pending → taken/missed/late/skipped, missed → late/taken.
 *       Khi skipped bắt buộc có skipReason.
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [taken, missed, late, skipped]
 *               actualTime:
 *                 type: string
 *                 format: date-time
 *               skipReason:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       400:
 *         description: Trạng thái không hợp lệ
 *       404:
 *         description: Bản ghi không tồn tại
 */
router.patch(
  '/:id/status',
  authentication,
  validateData(updateLogStatusSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('medicationLogController');
    await controller.updateLogStatus(req, res, next);
  },
);

export default router;
