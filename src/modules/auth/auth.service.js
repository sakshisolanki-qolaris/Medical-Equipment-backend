import bcrypt from 'bcrypt';
import * as AuthRepository from './auth.repository.js';

export const registerViewerUser = async (userData) => {
  const { name, email, phone_number, password } = userData;

  const existingPhone = await AuthRepository.findUserByPhone(phone_number);
  if (existingPhone) {
    throw new Error('User with this phone number already exists.');
  }

  if (email) {
    const existingEmail = await AuthRepository.findUserByEmail(email);
    if (existingEmail) {
      throw new Error('User with this email already exists.');
    }
  }
  
  const saltRounds = 10;
   password = await bcrypt.hash(password, saltRounds);

  const newUser = await AuthRepository.createUser({
    name,
    email,
    phone_number,
    password,
    role: 'Viewer' 
  });

  return newUser;
};