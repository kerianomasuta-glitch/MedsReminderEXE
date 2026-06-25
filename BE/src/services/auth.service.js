import bcrypt from 'bcryptjs';
import { BadRequestError } from '../error/error.js';

const SALT_ROUNDS = 10;

class AuthService {
    constructor({ userRepository, roleRepository }) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    #sanitizeUser(user) {
        const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
        delete obj.password;
        delete obj.authPin;
        return obj;
    }

    async registerUser({
        email,
        password,
        phone,
        name,
        roleId,
        authPin,
        birthday,
        gender
    }) {
        const normalizedEmail = email.toLowerCase().trim();
        const normalizedPhone = phone.trim();

        const existingUser = await this.userRepository.findUserByEmail(normalizedEmail);
        if (existingUser) {
            throw new BadRequestError('Email đã tồn tại');
        }

        const existingUserByPhone = await this.userRepository.findUserByPhone(normalizedPhone);
        if (existingUserByPhone) {
            throw new BadRequestError('Số điện thoại đã tồn tại');
        }

        const role = await this.roleRepository.findRoleById(roleId);
        if (!role) {
            throw new BadRequestError('Role không tồn tại');
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const hashedAuthPin = authPin ? await bcrypt.hash(authPin, SALT_ROUNDS) : undefined;

        const newUser = await this.userRepository.createUser({
            email: normalizedEmail,
            password: hashedPassword,
            phone: normalizedPhone,
            name,
            roleId,
            authPin: hashedAuthPin,
            birthday,
            gender
        });

        return this.#sanitizeUser(newUser);
    }
}

export default AuthService;
