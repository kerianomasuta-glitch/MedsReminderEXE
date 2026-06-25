import User from '../models/user.js';
import { mapMongooseError } from '../utils/mongooseError.js';

class UserRepository {
    findUserByEmail = async (email) => {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return null;
        }
        return existingUser;
    }
    findUserByPhone = async (phone) => {
        const existingUser = await User.findOne({ phone });
        if (!existingUser) {
            return null;
        }
        return existingUser;
    }
    findUserById = async (id) => {
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return null;
        }
        return existingUser;
    }
    findUserByGoogleId = async (googleId) => {
        const existingUser = await User.findOne({ googleId });
        if (!existingUser) {
            return null;
        }
        return existingUser;
    }
    createUser = async ({
        email,
        password,
        phone,
        name,
        roleId,
        authPin,
        birthday,
        gender
    }) => {
        const newUser = new User({
            email,
            phone,
            password,
            name,
            roleId,
            authPin,
            birthday,
            gender
        });
        await newUser.save();
        return newUser;
    }
}

export default UserRepository;