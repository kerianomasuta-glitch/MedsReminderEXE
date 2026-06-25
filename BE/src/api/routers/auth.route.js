import express from 'express';
import {
  registerUserSchema,
  loginCaregiverSchema,
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
 *     summary: Đăng ký tài khoản
 *     description: Tạo tài khoản mới với role được chỉ định qua roleId.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, roleId]
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
 *                 description: 10 số, bắt đầu bằng 0
 *                 example: "0901234567"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: matkhau123
 *               roleId:
 *                 type: string
 *                 description: ObjectId của role
 *                 example: 64f000000000000000000010
 *               authPin:
 *                 type: string
 *                 description: Mã PIN 4 chữ số (tuỳ chọn)
 *                 example: "1234"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-20"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
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
 *                   example: User registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Dữ liệu không hợp lệ / Email - SĐT đã tồn tại / Role không tồn tại
 */
router.post(
  '/register',
  validateData(registerUserSchema),
  async (req, res, next) => {
    const authController = req.container.resolve('authController');
    await authController.registerUser(req, res, next);
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
