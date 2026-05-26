import User from './user.model.js';

export const findUserByPhone = async (phone_number) => {
  return await User.findOne({ where: { phone_number } });
};

export const findUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};