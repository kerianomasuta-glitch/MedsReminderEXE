import User from '../models/user.js';

class UserRepository {
  findUserByEmail = async (email) => User.findOne({ email });

  findUserByPhone = async (phone) => User.findOne({ phone });

  findUserByEmailWithPassword = async (email) =>
    User.findOne({ email }).select('+password').populate('roleId');

  findUserByPhoneWithPassword = async (phone) =>
    User.findOne({ phone }).select('+password').populate('roleId');

  findUserById = async (id) => User.findById(id).populate('roleId');

  findUserByGoogleId = async (googleId) => User.findOne({ googleId });

  createUser = async ({
    email,
    password,
    phone,
    name,
    roleId,
    authPin,
    birthday,
    gender,
  }) => {
    const newUser = new User({
      email,
      phone,
      password,
      name,
      roleId,
      authPin,
      birthday,
      gender,
    });
    await newUser.save();
    return newUser;
  };
}

export default UserRepository;
