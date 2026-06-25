import express from 'express';
import {
  registerCaregiverSchema,
  loginCaregiverSchema,
  loginPatientSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../../validators/auth.validator.js';
import {
  validateData,
  authentication,
  getUserDeviceName,
} from '../middleware/middleware.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Đăng ký, đăng nhập và quản lý phiên người dùng
 */

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng ký tài khoản người thân (Caregiver)
 *     description: |
 *       Chỉ dành cho người thân tự đăng ký. Role `caregiver` được gán tự động.
 *       Bệnh nhân không đăng ký qua endpoint này — được tạo bởi caregiver sau khi đăng nhập.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 format: email
 *                 example: nguyenvana@example.com
 *               phone:
 *                 type: string
 *                 description: SĐT người thân — bệnh nhân dùng số này khi đăng nhập bằng PIN
 *                 example: "0901234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: matkhau123
 *     responses:
 *       201:
 *         description: Đăng ký thành công
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
 *                   example: Đăng ký tài khoản người thân thành công
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ / Email hoặc SĐT đã tồn tại / Role caregiver chưa khởi tạo
 */
router.post(
  '/register',
  validateData(registerCaregiverSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.registerCaregiver(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập (Caregiver & Admin)
 *     description: |
 *       Đăng nhập bằng email **hoặc** số điện thoại cùng mật khẩu.
 *       Chỉ dành cho role `caregiver` và `admin`. Patient dùng endpoint PIN riêng.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [email, password]
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: caregiver@example.com
 *                   password:
 *                     type: string
 *                     format: password
 *                     example: matkhau123
 *               - type: object
 *                 required: [phone, password]
 *                 properties:
 *                   phone:
 *                     type: string
 *                     example: "0901234567"
 *                   password:
 *                     type: string
 *                     format: password
 *                     example: matkhau123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: Đăng nhập thành công
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         description: Sai email/SĐT hoặc mật khẩu
 *       403:
 *         description: Tài khoản patient không được dùng endpoint này
 */
router.post(
  '/login',
  getUserDeviceName,
  validateData(loginCaregiverSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.loginUser(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/auth/login/patient:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập bệnh nhân (PIN)
 *     description: |
 *       Bệnh nhân đăng nhập bằng **số điện thoại của người thân (caregiver)** và **mã PIN 4 số**
 *       do caregiver đặt khi tạo hồ sơ. Hệ thống so khớp PIN với từng bệnh nhân đã liên kết
 *       với caregiver đó và trả JWT cho đúng bệnh nhân.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [caregiverPhone, authPin]
 *             properties:
 *               caregiverPhone:
 *                 type: string
 *                 description: SĐT đăng ký của người thân (caregiver)
 *                 example: "0901234567"
 *               authPin:
 *                 type: string
 *                 description: Mã PIN 4 chữ số
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
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
 *                   example: Đăng nhập thành công
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         description: SĐT người thân hoặc mã PIN không đúng
 */
router.post(
  '/login/patient',
  getUserDeviceName,
  validateData(loginPatientSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.loginPatient(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Làm mới access token
 *     description: Dùng refresh token để lấy cặp access/refresh token mới. Token cũ sẽ bị thu hồi.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken, deviceId]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               deviceId:
 *                 type: string
 *                 example: DEVICE_A1B2C3D4
 *     responses:
 *       200:
 *         description: Làm mới token thành công
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
 *                   example: Làm mới token thành công
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: Refresh token không hợp lệ hoặc đã hết hạn
 */
router.post(
  '/refresh',
  getUserDeviceName,
  validateData(refreshTokenSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.refreshUserToken(req, res, next);
  },
);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng xuất
 *     description: Thu hồi refresh token của thiết bị hiện tại.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceId]
 *             properties:
 *               deviceId:
 *                 type: string
 *                 example: DEVICE_A1B2C3D4
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
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
 *                   example: Đăng xuất thành công
 *       401:
 *         description: Chưa đăng nhập hoặc phiên không tồn tại
 */
router.post(
  '/logout',
  authentication,
  validateData(logoutSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.logoutUser(req, res, next);
  },
);

export default router;
