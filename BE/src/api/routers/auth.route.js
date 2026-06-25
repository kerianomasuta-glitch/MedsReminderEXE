import express from 'express';
import { registerUserSchema } from '../../validators/auth.validator.js';
import { validateData } from '../middleware/middleware.js';

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
 *     summary: Đăng ký tài khoản người dùng
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
 *                 description: Mã PIN 4-6 chữ số (tuỳ chọn)
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
    }
);

export default router;
