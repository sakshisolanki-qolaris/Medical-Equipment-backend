import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './user.model.js';
import * as AuthService from './auth.service.js';
import 'dotenv/config';

export const login = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    const user = await User.findOne({ where: { phone_number } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const registerViewer = async (req, res) => {
  try {
    const newUser = await AuthService.registerViewerUser(req.body);

    const { password, ...safeUserData } = newUser.toJSON();

    return res.status(201).json({
      message: 'Viewer registered successfully',
      user: safeUserData
    });
  } catch (error) {
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


export const logout = async (req, res) => {
  try {
    // In a stateless JWT architecture, the server simply acknowledges the request.
    // The actual logout responsibility (deleting the token) lies with the client.
    
    /* Future-proofing: If you implement a Token Blacklist table later, 
      you would extract the token from req.headers.authorization and save it 
      to the database here so it cannot be used again before its 8-hour expiry.
    */

    return res.status(200).json({
      message: 'Logout successful. Client must clear the local token.'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};