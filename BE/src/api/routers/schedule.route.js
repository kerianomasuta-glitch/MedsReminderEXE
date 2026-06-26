import express from 'express';
import {
  createScheduleSchema,
  updateScheduleSchema,
} from '../../validators/schedule.validator.js';
import {
  validateData,
  authentication,
  authorizationByRole,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Schedule
 *     description: Quản lý lịch uống thuốc
 */

/**
 * @openapi
 * /api/v1/schedules:
 *   post:
 *     tags: [Schedule]
 *     summary: Tạo lịch uống thuốc
 *     description: Caregiver/admin đặt lịch cho một đơn thuốc (prescription) của bệnh nhân.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, prescriptionId, startDate, timeSlots]
 *             properties:
 *               patientId:
 *                 type: string
 *               prescriptionId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-25"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-07-25"
 *               frequencyType:
 *                 type: string
 *                 enum: [daily, weekly, interval, as_needed]
 *                 default: daily
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [time]
 *                   properties:
 *                     time:
 *                       type: string
 *                       example: "08:00"
 *                     dosageNote:
 *                       type: string
 *                       example: Uống sau ăn
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: "0=CN, 1=T2 ... 6=T7 (bắt buộc khi weekly)"
 *               intervalDays:
 *                 type: integer
 *                 description: Cách N ngày (bắt buộc khi interval)
 *               reminderMinutesBefore:
 *                 type: integer
 *                 default: 5
 *               timezone:
 *                 type: string
 *                 default: Asia/Ho_Chi_Minh
 *     responses:
 *       201:
 *         description: Tạo lịch thành công
 *       400:
 *         description: Dữ liệu không hợp lệ / Bệnh nhân hoặc đơn thuốc không tồn tại
 */
router.post(
  '/',
  authentication,
  validateData(createScheduleSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('scheduleController');
    await controller.createSchedule(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/schedules/patient/{patientId}:
 *   get:
 *     tags: [Schedule]
 *     summary: Danh sách lịch uống thuốc của bệnh nhân
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
 */
router.get(
  '/patient/:patientId',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('scheduleController');
    await controller.getSchedulesByPatient(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/schedules/{id}:
 *   get:
 *     tags: [Schedule]
 *     summary: Chi tiết lịch uống thuốc
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
 *         description: Lịch không tồn tại
 */
router.get(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('scheduleController');
    await controller.getScheduleById(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/schedules/{id}:
 *   put:
 *     tags: [Schedule]
 *     summary: Cập nhật lịch uống thuốc
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
 *               patientId:
 *                 type: string
 *               prescriptionId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               frequencyType:
 *                 type: string
 *                 enum: [daily, weekly, interval, as_needed]
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                     dosageNote:
 *                       type: string
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: integer
 *               intervalDays:
 *                 type: integer
 *               reminderMinutesBefore:
 *                 type: integer
 *               timezone:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Lịch không tồn tại
 */
router.put(
  '/:id',
  authentication,
  validateData(updateScheduleSchema),
  async (req, res, next) => {
    const controller = req.container.resolve('scheduleController');
    await controller.updateSchedule(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/schedules/{id}:
 *   delete:
 *     tags: [Schedule]
 *     summary: Xóa lịch uống thuốc (soft delete)
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
 *         description: Lịch không tồn tại
 */
router.delete(
  '/:id',
  authentication,
  async (req, res, next) => {
    const controller = req.container.resolve('scheduleController');
    await controller.deleteSchedule(req, res, next);
  },
);

export default router;
