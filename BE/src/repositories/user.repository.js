import User from '../models/user.js';

class UserRepository {
  findUserByEmail = async (email) => User.findOne({ email });

  findUserByPhone = async (phone) => User.findOne({ phone });

  findUserByPhoneWithRole = async (phone) =>
    User.findOne({ phone: phone.trim() }).populate('roleId');

  findUserByEmailWithPassword = async (email) =>
    User.findOne({ email }).select('+password').populate('roleId');

  findUserByPhoneWithPassword = async (phone) =>
    User.findOne({ phone }).select('+password').populate('roleId');

  findUserById = async (id) => User.findById(id).populate('roleId');

  findUserByGoogleId = async (googleId) => User.findOne({ googleId });

  createCaregiver = async ({ email, password, phone, name, roleId }) => {
    const user = new User({ email, password, phone, name, roleId });
    await user.save();
    return user.populate('roleId');
  };

  createPatient = async ({ name, roleId, birthday, gender }) => {
    const user = new User({ name, roleId, birthday, gender });
    await user.save();
    return user.populate('roleId');
  };

  createAdmin = async ({ email, password, phone, name, roleId }) => {
    const user = new User({ email, password, phone, name, roleId });
    await user.save();
    return user.populate('roleId');
  };
}

export default UserRepository;
